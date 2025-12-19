'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Loader2, Plus, X, GripVertical, Type, Hash, Calendar, List, CheckSquare, Link, Mail, Phone } from 'lucide-react';

export interface CustomField {
  id: string;
  name: string;
  type: 'TEXT' | 'NUMBER' | 'DATE' | 'DROPDOWN' | 'MULTISELECT' | 'CHECKBOX' | 'URL' | 'EMAIL' | 'PHONE';
  options?: string[];
  isRequired: boolean;
}

export interface CustomFieldValue {
  fieldId: string;
  value: string | number | boolean | string[] | null;
}

interface CustomFieldsEditorProps {
  fields: CustomField[];
  values: CustomFieldValue[];
  onChange: (values: CustomFieldValue[]) => void;
  readOnly?: boolean;
}

const FIELD_TYPE_ICONS: Record<string, React.ReactNode> = {
  TEXT: <Type className="size-4" />,
  NUMBER: <Hash className="size-4" />,
  DATE: <Calendar className="size-4" />,
  DROPDOWN: <List className="size-4" />,
  MULTISELECT: <List className="size-4" />,
  CHECKBOX: <CheckSquare className="size-4" />,
  URL: <Link className="size-4" />,
  EMAIL: <Mail className="size-4" />,
  PHONE: <Phone className="size-4" />,
};

const FIELD_TYPE_LABELS: Record<string, string> = {
  TEXT: 'Text',
  NUMBER: 'Number',
  DATE: 'Date',
  DROPDOWN: 'Dropdown',
  MULTISELECT: 'Multi-select',
  CHECKBOX: 'Checkbox',
  URL: 'URL',
  EMAIL: 'Email',
  PHONE: 'Phone',
};

export function CustomFieldsEditor({ fields, values, onChange, readOnly }: CustomFieldsEditorProps) {
  const getFieldValue = (fieldId: string) => {
    return values.find(v => v.fieldId === fieldId)?.value ?? null;
  };

  const updateFieldValue = (fieldId: string, value: any) => {
    const existing = values.find(v => v.fieldId === fieldId);
    if (existing) {
      onChange(values.map(v => v.fieldId === fieldId ? { ...v, value } : v));
    } else {
      onChange([...values, { fieldId, value }]);
    }
  };

  if (fields.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
        <Icon icon="solar:tuning-2-linear" className="size-4 text-primary/70" />
        Custom Fields
      </h4>

      <div className="space-y-3">
        {fields.map((field) => (
          <div key={field.id} className="grid gap-1.5">
            <Label className="text-sm flex items-center gap-2">
              {FIELD_TYPE_ICONS[field.type]}
              {field.name}
              {field.isRequired && <span className="text-destructive">*</span>}
            </Label>
            
            {field.type === 'TEXT' && (
              <Input
                value={(getFieldValue(field.id) as string) || ''}
                onChange={(e) => updateFieldValue(field.id, e.target.value)}
                disabled={readOnly}
                placeholder={`Enter ${field.name.toLowerCase()}`}
              />
            )}

            {field.type === 'NUMBER' && (
              <Input
                type="number"
                value={(getFieldValue(field.id) as number) || ''}
                onChange={(e) => updateFieldValue(field.id, parseFloat(e.target.value) || null)}
                disabled={readOnly}
                placeholder="0"
              />
            )}

            {field.type === 'DATE' && (
              <Input
                type="date"
                value={(getFieldValue(field.id) as string) || ''}
                onChange={(e) => updateFieldValue(field.id, e.target.value)}
                disabled={readOnly}
              />
            )}

            {field.type === 'DROPDOWN' && field.options && (
              <Select
                value={(getFieldValue(field.id) as string) || ''}
                onValueChange={(value) => updateFieldValue(field.id, value)}
                disabled={readOnly}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                  {field.options.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {field.type === 'MULTISELECT' && field.options && (
              <div className="flex flex-wrap gap-2">
                {field.options.map((option) => {
                  const selected = ((getFieldValue(field.id) as string[]) || []).includes(option);
                  return (
                    <Badge
                      key={option}
                      variant={selected ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => {
                        if (readOnly) return;
                        const current = (getFieldValue(field.id) as string[]) || [];
                        if (selected) {
                          updateFieldValue(field.id, current.filter(v => v !== option));
                        } else {
                          updateFieldValue(field.id, [...current, option]);
                        }
                      }}
                    >
                      {option}
                    </Badge>
                  );
                })}
              </div>
            )}

            {field.type === 'CHECKBOX' && (
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={(getFieldValue(field.id) as boolean) || false}
                  onCheckedChange={(checked) => updateFieldValue(field.id, !!checked)}
                  disabled={readOnly}
                />
                <span className="text-sm text-muted-foreground">Yes</span>
              </div>
            )}

            {field.type === 'URL' && (
              <Input
                type="url"
                value={(getFieldValue(field.id) as string) || ''}
                onChange={(e) => updateFieldValue(field.id, e.target.value)}
                disabled={readOnly}
                placeholder="https://example.com"
              />
            )}

            {field.type === 'EMAIL' && (
              <Input
                type="email"
                value={(getFieldValue(field.id) as string) || ''}
                onChange={(e) => updateFieldValue(field.id, e.target.value)}
                disabled={readOnly}
                placeholder="email@example.com"
              />
            )}

            {field.type === 'PHONE' && (
              <Input
                type="tel"
                value={(getFieldValue(field.id) as string) || ''}
                onChange={(e) => updateFieldValue(field.id, e.target.value)}
                disabled={readOnly}
                placeholder="+1 234 567 8900"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Custom Fields Manager for Settings
interface CustomFieldsManagerProps {
  fields: CustomField[];
  onCreate: (field: Omit<CustomField, 'id'>) => Promise<void>;
  onDelete: (fieldId: string) => Promise<void>;
  isLoading?: boolean;
}

export function CustomFieldsManager({ fields, onCreate, onDelete, isLoading }: CustomFieldsManagerProps) {
  const [showCreateDialog, setShowCreateDialog] = React.useState(false);
  const [newField, setNewField] = React.useState({
    name: '',
    type: 'TEXT' as CustomField['type'],
    options: [] as string[],
    isRequired: false,
  });
  const [optionInput, setOptionInput] = React.useState('');
  const [isCreating, setIsCreating] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const handleCreate = async () => {
    if (!newField.name.trim()) return;
    
    setIsCreating(true);
    try {
      await onCreate({
        name: newField.name.trim(),
        type: newField.type,
        options: ['DROPDOWN', 'MULTISELECT'].includes(newField.type) ? newField.options : undefined,
        isRequired: newField.isRequired,
      });
      setShowCreateDialog(false);
      setNewField({ name: '', type: 'TEXT', options: [], isRequired: false });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await onDelete(id);
    } finally {
      setDeletingId(null);
    }
  };

  const addOption = () => {
    if (optionInput.trim() && !newField.options.includes(optionInput.trim())) {
      setNewField(prev => ({
        ...prev,
        options: [...prev.options, optionInput.trim()],
      }));
      setOptionInput('');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Custom Fields</h3>
        <Button size="sm" onClick={() => setShowCreateDialog(true)}>
          <Plus className="size-4 mr-1" />
          Add Field
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : fields.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Icon icon="solar:tuning-2-linear" className="size-12 mx-auto mb-3 opacity-30" />
          <p>No custom fields yet</p>
          <p className="text-sm">Create custom fields to add more data to your tasks</p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {fields.map((field) => (
              <motion.div
                key={field.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 group"
              >
                <div className="size-8 rounded-md bg-background flex items-center justify-center border shrink-0">
                  {FIELD_TYPE_ICONS[field.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{field.name}</span>
                    {field.isRequired && (
                      <Badge variant="secondary" className="text-[10px]">Required</Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {FIELD_TYPE_LABELS[field.type]}
                    {field.options && field.options.length > 0 && (
                      <> • {(field.options as string[]).length} options</>
                    )}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive"
                  onClick={() => handleDelete(field.id)}
                  disabled={deletingId === field.id}
                >
                  {deletingId === field.id ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <X className="size-4" />
                  )}
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Create Field Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Custom Field</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Field Name</Label>
              <Input
                value={newField.name}
                onChange={(e) => setNewField(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Project Code"
              />
            </div>

            <div className="grid gap-2">
              <Label>Field Type</Label>
              <Select
                value={newField.type}
                onValueChange={(value) => setNewField(prev => ({ ...prev, type: value as CustomField['type'] }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(FIELD_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      <div className="flex items-center gap-2">
                        {FIELD_TYPE_ICONS[value]}
                        {label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {['DROPDOWN', 'MULTISELECT'].includes(newField.type) && (
              <div className="grid gap-2">
                <Label>Options</Label>
                <div className="flex gap-2">
                  <Input
                    value={optionInput}
                    onChange={(e) => setOptionInput(e.target.value)}
                    placeholder="Add option"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addOption())}
                  />
                  <Button type="button" variant="outline" onClick={addOption}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {newField.options.map((option) => (
                    <Badge key={option} variant="secondary">
                      {option}
                      <button
                        onClick={() => setNewField(prev => ({
                          ...prev,
                          options: prev.options.filter(o => o !== option),
                        }))}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="size-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Checkbox
                id="required"
                checked={newField.isRequired}
                onCheckedChange={(checked) => setNewField(prev => ({ ...prev, isRequired: !!checked }))}
              />
              <Label htmlFor="required" className="text-sm">
                Required field
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!newField.name.trim() || isCreating}>
              {isCreating ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
              Create Field
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CustomFieldsEditor;
