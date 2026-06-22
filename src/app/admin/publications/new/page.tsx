'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiToggleLeft, FiToggleRight } from 'react-icons/fi';

import SectionCard    from '@/components/ui/SectionCard';
import FormField      from '@/components/ui/FormField';
import TextInput      from '@/components/ui/TextInput';
import TextareaInput  from '@/components/ui/TextareaInput';
import BilingualInput from '@/components/ui/BilingualInput';
import TagInput       from '@/components/ui/TagInput';
import SaveButton     from '@/components/ui/SaveButton';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import FileUpload, { UploadedFile } from '@/components/ui/FileUpload';

const TYPES = [
  { value: 'journal',       label: 'Journal article' },
  { value: 'conference',    label: 'Conference paper' },
  { value: 'book_chapter',  label: 'Book chapter' },
  { value: 'working_paper', label: 'Working paper' },
  { value: 'thesis',        label: 'Thesis' },
  { value: 'other',         label: 'Other' },
];

interface PubForm {
  title:       { en: string; ne: string };
  abstract:    { en: string; ne: string };
  authors:     string[];
  year:        string;
  type:        string;
  journal:     string;
  tags:        string[];
  slug:        string;
  fileUrl:     string;
  fileName:    string;
  doi:         string;
  externalUrl: string;
  featured:    boolean;
  published:   boolean;
}

const EMPTY: PubForm = {
  title:       { en: '', ne: '' },
  abstract:    { en: '', ne: '' },
  authors:     [],
  year:        String(new Date().getFullYear()),
  type:        'journal',
  journal:     '',
  tags:        [],
  slug:        '',
  fileUrl:     '',
  fileName:    '',
  doi:         '',
  externalUrl: '',
  featured:    false,
  published:   true,
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

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

export default function AddPublicationPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [form, setForm] = useState<PubForm>(EMPTY);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof PubForm, string>>>({});
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/signin');
    if (status === 'authenticated' && (session?.user as any)?.role !== 'admin') router.push('/');
  }, [status, session, router]);

  // Auto-generate slug from EN title
  useEffect(() => {
    if (form.title.en) {
      setForm((prev) => ({ ...prev, slug: slugify(form.title.en) }));
    }
  }, [form.title.en]);

  const set = <K extends keyof PubForm>(key: K, value: PubForm[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const setBilingual = (key: 'title' | 'abstract', lang: 'en' | 'ne', value: string) =>
    setForm((prev) => ({ ...prev, [key]: { ...prev[key], [lang]: value } }));

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!form.title.en.trim())  e.title    = 'English title is required';
    if (!form.abstract.en.trim()) e.abstract = 'English abstract is required';
    if (form.authors.length === 0) e.authors  = 'At least one author is required';
    if (!form.year || isNaN(Number(form.year))) e.year = 'Valid year is required';
    if (!form.journal.trim())   e.journal  = 'Journal / venue name is required';
    if (!form.slug.trim())    e.slug    = 'Slug is required';
    if (!uploadedFile)        (e as any).fileUrl = 'Please upload a file';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSaveState('saving');
    try {
      const res = await fetch('/api/publications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          year:     Number(form.year),
          fileUrl:  uploadedFile!.key,
          fileName: uploadedFile!.fileName,
        }),
      });

      if (res.ok) {
        setSaveState('saved');
        setTimeout(() => router.push('/admin/publications'), 1000);
      } else {
        const data = await res.json();
        setSaveState('error');
        if (data.error?.includes('slug')) {
          setErrors((prev) => ({ ...prev, slug: 'This slug is already taken' }));
        }
      }
    } catch {
      setSaveState('error');
    }
  };

  if (status === 'loading') return <LoadingSpinner text="Loading..." />;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/publications" className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
          <FiArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Add publication</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Create a new research entry</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Title & Abstract */}
        <SectionCard title="Content" description="Title and abstract in both languages">
          <FormField label="Title" required>
            <BilingualInput
              valueEn={form.title.en}
              valueNe={form.title.ne}
              onChangeEn={(v) => setBilingual('title', 'en', v)}
              onChangeNe={(v) => setBilingual('title', 'ne', v)}
              placeholder="Sustainable development frameworks in rural Nepal"
              error={errors.title}
            />
          </FormField>
          <FormField label="Abstract" required>
            <BilingualInput
              valueEn={form.abstract.en}
              valueNe={form.abstract.ne}
              onChangeEn={(v) => setBilingual('abstract', 'en', v)}
              onChangeNe={(v) => setBilingual('abstract', 'ne', v)}
              placeholder="This study examines..."
              multiline
              rows={5}
              error={errors.abstract}
            />
          </FormField>
        </SectionCard>

        {/* Metadata */}
        <SectionCard title="Metadata">
          <FormField label="Authors" required hint="Type a name and press Enter">
            <TagInput
              tags={form.authors}
              onChange={(v) => set('authors', v)}
              placeholder="D.P. Bhattarai — press Enter"
            />
            {errors.authors && <p className="mt-1 text-[11px] text-red-500">{errors.authors}</p>}
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Year" required>
              <TextInput
                type="number"
                min={1900}
                max={new Date().getFullYear() + 1}
                value={form.year}
                onChange={(e) => set('year', e.target.value)}
                error={errors.year}
              />
            </FormField>
            <FormField label="Publication type" required>
              <select
                value={form.type}
                onChange={(e) => set('type', e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-[var(--surface)] border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-maroon-700/20"
              >
                {TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </FormField>
          </div>

          <FormField label="Journal / conference / venue" required>
            <TextInput
              value={form.journal}
              onChange={(e) => set('journal', e.target.value)}
              placeholder="Nepal Journal of Development Studies"
              error={errors.journal}
            />
          </FormField>

          <FormField label="Tags" hint="Keywords for filtering and search">
            <TagInput
              tags={form.tags}
              onChange={(v) => set('tags', v)}
              placeholder="Sustainability, Policy… press Enter"
            />
          </FormField>
        </SectionCard>

        {/* File & identifiers */}
        <SectionCard title="File & identifiers">
          <FormField label="Upload PDF" required hint="Drag & drop or click — uploads directly to Cloudflare R2">
            <FileUpload value={uploadedFile} onChange={setUploadedFile} />
            {(errors as any).fileUrl && (
              <p className="mt-1 text-[11px] text-red-500">{(errors as any).fileUrl}</p>
            )}
          </FormField>

          <FormField label="URL slug" required hint="Auto-generated from title — must be unique">
            <TextInput
              value={form.slug}
              onChange={(e) => set('slug', slugify(e.target.value))}
              placeholder="sustainable-development-frameworks-rural-nepal"
              error={errors.slug}
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="DOI" hint="Optional">
              <TextInput
                value={form.doi}
                onChange={(e) => set('doi', e.target.value)}
                placeholder="10.1000/xyz123"
              />
            </FormField>
            <FormField label="External URL" hint="Optional — links to publisher page">
              <TextInput
                value={form.externalUrl}
                onChange={(e) => set('externalUrl', e.target.value)}
                placeholder="https://publisher.com/article"
              />
            </FormField>
          </div>
        </SectionCard>

        {/* Visibility */}
        <SectionCard title="Visibility">
          <div className="flex flex-col gap-3">
            <Toggle
              label="Published — visible to the public"
              checked={form.published}
              onChange={(v) => set('published', v)}
            />
            <Toggle
              label="Featured — shown on the home page"
              checked={form.featured}
              onChange={(v) => set('featured', v)}
            />
          </div>
        </SectionCard>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <Link href="/admin/publications" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
            ← Cancel
          </Link>
          <SaveButton state={saveState} label="Publish" />
        </div>

      </form>
    </div>
  );
}
