import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/v1/import - Import data
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const contentType = request.headers.get('content-type') || '';
    let data: any;

    if (contentType.includes('application/json')) {
      data = await request.json();
    } else if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      
      if (!file) {
        return NextResponse.json(
          { error: 'No file provided' },
          { status: 400 }
        );
      }

      const text = await file.text();
      
      if (file.name.endsWith('.json')) {
        data = JSON.parse(text);
      } else if (file.name.endsWith('.csv')) {
        // Parse CSV
        data = { tasks: parseCSV(text) };
      } else {
        return NextResponse.json(
          { error: 'Unsupported file format' },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'Unsupported content type' },
        { status: 400 }
      );
    }

    const results = {
      tasks: { created: 0, errors: 0 },
      lists: { created: 0, errors: 0 },
      tags: { created: 0, errors: 0 },
    };

    // Create a map for list names to IDs
    const listMap = new Map<string, string>();

    // Import Lists first
    if (data.lists && Array.isArray(data.lists)) {
      for (const list of data.lists) {
        try {
          const created = await prisma.taskList.create({
            data: {
              organizationId: session.user.organizationId,
              createdById: session.user.id,
              name: list.name,
              description: list.description,
              color: list.color || '#6366F1',
              icon: list.icon || 'solar:list-check-linear',
              position: 0,
            },
          });
          listMap.set(list.name, created.id);
          results.lists.created++;
        } catch (e) {
          results.lists.errors++;
        }
      }
    }

    // Import Tags
    const tagMap = new Map<string, string>();
    if (data.tags && Array.isArray(data.tags)) {
      for (const tag of data.tags) {
        try {
          const created = await prisma.tag.create({
            data: {
              organizationId: session.user.organizationId,
              name: tag.name,
              color: tag.color || '#6366F1',
            },
          });
          tagMap.set(tag.name, created.id);
          results.tags.created++;
        } catch (e) {
          results.tags.errors++;
        }
      }
    }

    // Import Tasks
    if (data.tasks && Array.isArray(data.tasks)) {
      for (const task of data.tasks) {
        try {
          // Find or create list
          let listId: string | undefined;
          if (task.listName) {
            if (listMap.has(task.listName)) {
              listId = listMap.get(task.listName);
            } else {
              // Look for existing list
              const existingList = await prisma.taskList.findFirst({
                where: {
                  organizationId: session.user.organizationId,
                  name: task.listName,
                },
              });
              if (existingList) {
                listId = existingList.id;
                listMap.set(task.listName, listId);
              }
            }
          }

          // Create task
          const created = await prisma.task.create({
            data: {
              organizationId: session.user.organizationId,
              createdById: session.user.id,
              title: task.title,
              description: task.description,
              status: task.status || 'TODO',
              priority: task.priority || 'MEDIUM',
              dueDate: task.dueDate ? new Date(task.dueDate) : null,
              completedAt: task.completedAt ? new Date(task.completedAt) : null,
              listId,
              position: 0,
            },
          });

          // Add tags
          if (task.tags && Array.isArray(task.tags)) {
            for (const tagName of task.tags) {
              let tagId = tagMap.get(tagName);
              
              if (!tagId) {
                // Look for existing tag
                const existingTag = await prisma.tag.findFirst({
                  where: {
                    organizationId: session.user.organizationId,
                    name: tagName,
                  },
                });
                
                if (existingTag) {
                  tagId = existingTag.id;
                } else {
                  // Create new tag
                  const newTag = await prisma.tag.create({
                    data: {
                      organizationId: session.user.organizationId,
                      name: tagName,
                      color: '#6366F1',
                    },
                  });
                  tagId = newTag.id;
                }
                tagMap.set(tagName, tagId);
              }

              await prisma.taskTag.create({
                data: {
                  taskId: created.id,
                  tagId,
                },
              });
            }
          }

          results.tasks.created++;
        } catch (e) {
          console.error('Error importing task:', e);
          results.tasks.errors++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error('Error importing data:', error);
    return NextResponse.json(
      { error: 'Failed to import data' },
      { status: 500 }
    );
  }
}

// Helper to parse CSV
function parseCSV(text: string): any[] {
  const lines = text.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '').toLowerCase());
  const tasks: any[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const task: any = {};

    headers.forEach((header, index) => {
      const value = values[index]?.trim() || '';
      
      switch (header) {
        case 'title':
          task.title = value;
          break;
        case 'description':
          task.description = value || null;
          break;
        case 'status':
          task.status = ['TODO', 'IN_PROGRESS', 'COMPLETED'].includes(value) ? value : 'TODO';
          break;
        case 'priority':
          task.priority = ['HIGH', 'MEDIUM', 'LOW', 'NONE'].includes(value) ? value : 'MEDIUM';
          break;
        case 'due date':
        case 'duedate':
          task.dueDate = value || null;
          break;
        case 'list':
        case 'listname':
          task.listName = value || null;
          break;
        case 'tags':
          task.tags = value ? value.split(',').map((t: string) => t.trim()).filter(Boolean) : [];
          break;
      }
    });

    if (task.title) {
      tasks.push(task);
    }
  }

  return tasks;
}

// Parse a CSV line handling quoted values
function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  values.push(current);
  return values;
}
