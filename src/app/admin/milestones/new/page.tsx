'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiToggleLeft, FiToggleRight } from 'react-icons/fi';

import SectionCard    from '@/components/ui/SectionCard';
import FormField      from '@/components/ui/FormField';
import TextInput      from '@/components/ui/TextInput';
import BilingualInput from '@/components/ui/BilingualInput';
import SaveButton     from '@/components/ui/SaveButton';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const CATEGORIES = [
  { value: 'early_life',  label: 'Early life' },
  { value: 'education',   label: 'Education' },
  { value: 'career',      label: 'Career' },
  { value: 'research',    label: 'Research' },
  { value: 'achievement', label: 'Achievement' },
];

interface MilestoneForm {
  year:        string;
  title:       { en: string; ne: string };
  description: { en: string; ne: string };
  category:    string;
  imageUrl:    string;
  sortOrder:   string;
  isCurrent:   boolean;
}

const EMPTY: MilestoneForm = {
  year:        String(new Date().getFullYear()),
  title:       { en: '', ne: '' },
  description: { en: '', ne: '' },
  category:    'career',
  imageUrl:    '',
  sortOrder:   '0',
  isCurrent:   false,
};

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
    >
      {checked
        ? <FiToggleRight size={22} className="text-maroon-700 dark:text-maroon-400" />
        : <FiToggleLeft  size={22} className="text-gray-400" />}
      {label}
    </button>
  );
}

export default function AddMilestonePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [form, setForm] = useState<MilestoneForm>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof MilestoneForm, string>>>({});
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/signin');
    if (status === 'authenticated' && (session?.user as any)?.role !== 'admin') router.push('/');
  }, [status, session, router]);

  // Default sortOrder to next available
  useEffect(() => {
    fetch('/api/milestones')
      .then((r) => r.json())
      .then(({ milestones }) => {
        const max = milestones.reduce((m: number, ms: any) => Math.max(m, ms.sortOrder ?? 0), 0);
        setForm((prev) => ({ ...prev, sortOrder: String(max + 1) }));
      });
  }, []);

  const set = <K extends keyof MilestoneForm>(key: K, value: MilestoneForm[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const setBilingual = (key: 'title' | 'description', lang: 'en' | 'ne', value: string) =>
    setForm((prev) => ({ ...prev, [key]: { ...prev[key], [lang]: value } }));

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!form.year.trim())          e.year        = 'Year is required';
    if (!form.title.en.trim())      e.title       = 'English title is required';
    if (!form.description.en.trim()) e.description = 'English description is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaveState('saving');
    try {
      const res = await fetch('/api/milestones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, sortOrder: Number(form.sortOrder) }),
      });
      if (res.ok) {
        setSaveState('saved');
        setTimeout(() => router.push('/admin/milestones'), 1000);
      } else {
        setSaveState('error');
      }
    } catch {
      setSaveState('error');
    }
  };

  if (status === 'loading') return <LoadingSpinner />;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/milestones" className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
          <FiArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Add milestone</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">New entry on the journey timeline</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        <SectionCard title="Content" description="Title and description in both languages">
          <FormField label="Title" required>
            <BilingualInput
              valueEn={form.title.en}
              valueNe={form.title.ne}
              onChangeEn={(v) => setBilingual('title', 'en', v)}
              onChangeNe={(v) => setBilingual('title', 'ne', v)}
              placeholder="PhD completed"
              error={errors.title}
            />
          </FormField>
          <FormField label="Description" required>
            <BilingualInput
              valueEn={form.description.en}
              valueNe={form.description.ne}
              onChangeEn={(v) => setBilingual('description', 'en', v)}
              onChangeNe={(v) => setBilingual('description', 'ne', v)}
              placeholder="Successfully defended doctoral thesis…"
              multiline
              rows={4}
              error={errors.description}
            />
          </FormField>
        </SectionCard>

        <SectionCard title="Details">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Year" required hint="e.g. 2010 or 2010–2014">
              <TextInput
                value={form.year}
                onChange={(e) => set('year', e.target.value)}
                placeholder="2010"
                error={errors.year}
              />
            </FormField>
            <FormField label="Category" required>
              <select
                value={form.category}
                onChange={(e) => set('category', e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-[var(--surface)] border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-maroon-700/20"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Sort order" hint="Lower numbers appear first">
              <TextInput
                type="number"
                min={0}
                value={form.sortOrder}
                onChange={(e) => set('sortOrder', e.target.value)}
              />
            </FormField>
            <FormField label="Image URL" hint="Optional photo for this milestone">
              <TextInput
                value={form.imageUrl}
                onChange={(e) => set('imageUrl', e.target.value)}
                placeholder="https://example.com/photo.jpg"
              />
            </FormField>
          </div>

          <Toggle
            label="Mark as current / ongoing"
            checked={form.isCurrent}
            onChange={(v) => set('isCurrent', v)}
          />
        </SectionCard>

        <div className="flex items-center justify-between pt-2">
          <Link href="/admin/milestones" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
            ← Cancel
          </Link>
          <SaveButton state={saveState} label="Add milestone" />
        </div>

      </form>
    </div>
  );
}
