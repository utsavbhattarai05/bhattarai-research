'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiLinkedin, FiGlobe } from 'react-icons/fi';

import SectionCard from '@/components/ui/SectionCard';
import FormField from '@/components/ui/FormField';
import TextInput from '@/components/ui/TextInput';
import TextareaInput from '@/components/ui/TextareaInput';
import BilingualInput from '@/components/ui/BilingualInput';
import TagInput from '@/components/ui/TagInput';
import SaveButton from '@/components/ui/SaveButton';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface ProfileForm {
  name:              { en: string; ne: string };
  title:             { en: string; ne: string };
  bio:               { en: string; ne: string };
  location:          { en: string; ne: string };
  quote:             { en: string; ne: string };
  email:             string;
  photoUrl:          string;
  cvUrl:             string;
  researchInterests: { en: string[]; ne: string[] };
  socialLinks: {
    linkedin:      string;
    googleScholar: string;
    researchGate:  string;
    website:       string;
    facebook:      string;
  };
}

const EMPTY: ProfileForm = {
  name:              { en: '', ne: '' },
  title:             { en: '', ne: '' },
  bio:               { en: '', ne: '' },
  location:          { en: 'Kathmandu, Nepal', ne: 'काठमाडौं, नेपाल' },
  quote:             { en: '', ne: '' },
  email:             '',
  photoUrl:          '',
  cvUrl:             '',
  researchInterests: { en: [], ne: [] },
  socialLinks:       { linkedin: '', googleScholar: '', researchGate: '', website: '', facebook: '' },
};

export default function EditProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [form, setForm] = useState<ProfileForm>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/signin');
    if (status === 'authenticated' && (session?.user as any)?.role !== 'admin') router.push('/');
  }, [status, session, router]);

  useEffect(() => {
    fetch('/api/profile')
      .then((r) => r.json())
      .then(({ profile }) => {
        if (profile) {
          setForm({
            name:              { en: profile.name?.en ?? '',    ne: profile.name?.ne ?? '' },
            title:             { en: profile.title?.en ?? '',   ne: profile.title?.ne ?? '' },
            bio:               { en: profile.bio?.en ?? '',     ne: profile.bio?.ne ?? '' },
            location:          { en: profile.location?.en ?? 'Kathmandu, Nepal', ne: profile.location?.ne ?? 'काठमाडौं, नेपाल' },
            quote:             { en: profile.quote?.en ?? '',   ne: profile.quote?.ne ?? '' },
            email:             profile.email ?? '',
            photoUrl:          profile.photoUrl ?? '',
            cvUrl:             profile.cvUrl ?? '',
            researchInterests: { en: profile.researchInterests?.en ?? [], ne: profile.researchInterests?.ne ?? [] },
            socialLinks: {
              linkedin:      profile.socialLinks?.linkedin ?? '',
              googleScholar: profile.socialLinks?.googleScholar ?? '',
              researchGate:  profile.socialLinks?.researchGate ?? '',
              website:       profile.socialLinks?.website ?? '',
              facebook:      (profile.socialLinks as any)?.facebook ?? '',
            },
          });
        }
      })
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  const set = <K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const setBilingual = (key: 'name' | 'title' | 'bio' | 'location' | 'quote', lang: 'en' | 'ne', value: string) =>
    setForm((prev) => ({ ...prev, [key]: { ...prev[key], [lang]: value } }));

  const setSocial = (key: keyof ProfileForm['socialLinks'], value: string) =>
    setForm((prev) => ({ ...prev, socialLinks: { ...prev.socialLinks, [key]: value } }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveState('saving');
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setSaveState(res.ok ? 'saved' : 'error');
      if (res.ok) setTimeout(() => setSaveState('idle'), 2500);
    } catch {
      setSaveState('error');
    }
  };

  if (status === 'loading' || loading) return <LoadingSpinner text="Loading profile..." />;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin" className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
          <FiArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Edit profile</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Update public-facing information</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Identity */}
        <SectionCard title="Identity" description="Name and professional title shown on the site">
          <FormField label="Full name" required>
            <BilingualInput
              valueEn={form.name.en}
              valueNe={form.name.ne}
              onChangeEn={(v) => setBilingual('name', 'en', v)}
              onChangeNe={(v) => setBilingual('name', 'ne', v)}
              placeholder="Prof. Dhruba Prasad Bhattarai"
            />
          </FormField>
          <FormField label="Title / role" required>
            <BilingualInput
              valueEn={form.title.en}
              valueNe={form.title.ne}
              onChangeEn={(v) => setBilingual('title', 'en', v)}
              onChangeNe={(v) => setBilingual('title', 'ne', v)}
              placeholder="Researcher · Scholar · Nepal"
            />
          </FormField>
        </SectionCard>

        {/* Bio */}
        <SectionCard title="Biography" description="Shown on the About and Home pages">
          <FormField label="Bio" required>
            <BilingualInput
              valueEn={form.bio.en}
              valueNe={form.bio.ne}
              onChangeEn={(v) => setBilingual('bio', 'en', v)}
              onChangeNe={(v) => setBilingual('bio', 'ne', v)}
              placeholder="Professor Dhruba Prasad Bhattarai is a researcher..."
              multiline
              rows={5}
            />
          </FormField>
          <FormField label="Favourite quote" hint="Displayed at the bottom of the Journey page">
            <BilingualInput
              valueEn={form.quote.en}
              valueNe={form.quote.ne}
              onChangeEn={(v) => setBilingual('quote', 'en', v)}
              onChangeNe={(v) => setBilingual('quote', 'ne', v)}
              placeholder="The pursuit of knowledge is a journey without a destination…"
              multiline
              rows={2}
            />
          </FormField>
        </SectionCard>

        {/* Research interests */}
        <SectionCard title="Research interests" description="Tag-style list shown on the About page">
          <FormField label="English interests">
            <TagInput
              tags={form.researchInterests.en}
              onChange={(tags) => set('researchInterests', { ...form.researchInterests, en: tags })}
              placeholder="Type an interest and press Enter"
            />
          </FormField>
          <FormField label="Nepali interests">
            <TagInput
              tags={form.researchInterests.ne}
              onChange={(tags) => set('researchInterests', { ...form.researchInterests, ne: tags })}
              placeholder="नेपालीमा टाइप गर्नुस् र Enter थिच्नुस्"
            />
          </FormField>
        </SectionCard>

        {/* Contact */}
        <SectionCard title="Contact & location">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Email" required>
              <TextInput
                type="text"
                inputMode="email"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                placeholder="dp.bhattarai@email.com"
              />
            </FormField>
            <FormField label="Location">
              <BilingualInput
                valueEn={form.location.en}
                valueNe={form.location.ne}
                onChangeEn={(v) => setBilingual('location', 'en', v)}
                onChangeNe={(v) => setBilingual('location', 'ne', v)}
                placeholder="Kathmandu, Nepal"
              />
            </FormField>
          </div>
        </SectionCard>

        {/* Files */}
        <SectionCard title="Files & media" description="URLs for the photo and CV">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Photo URL" hint="Direct link to profile photo">
              <TextInput
                value={form.photoUrl}
                onChange={(e) => set('photoUrl', e.target.value)}
                placeholder="https://example.com/photo.jpg"
              />
            </FormField>
            <FormField label="CV URL" hint="PDF link shown on Home & About pages">
              <TextInput
                value={form.cvUrl}
                onChange={(e) => set('cvUrl', e.target.value)}
                placeholder="https://example.com/cv.pdf"
              />
            </FormField>
          </div>
        </SectionCard>

        {/* Social links */}
        <SectionCard title="Social & academic links">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="LinkedIn">
              <div className="relative">
                <FiLinkedin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <TextInput
                  value={form.socialLinks.linkedin}
                  onChange={(e) => setSocial('linkedin', e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                  className="pl-9"
                />
              </div>
            </FormField>
            <FormField label="Google Scholar">
              <div className="relative">
                <FiGlobe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <TextInput
                  value={form.socialLinks.googleScholar}
                  onChange={(e) => setSocial('googleScholar', e.target.value)}
                  placeholder="https://scholar.google.com/..."
                  className="pl-9"
                />
              </div>
            </FormField>
            <FormField label="ResearchGate">
              <div className="relative">
                <FiGlobe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <TextInput
                  value={form.socialLinks.researchGate}
                  onChange={(e) => setSocial('researchGate', e.target.value)}
                  placeholder="https://researchgate.net/profile/..."
                  className="pl-9"
                />
              </div>
            </FormField>
            <FormField label="Personal website">
              <div className="relative">
                <FiGlobe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <TextInput
                  value={form.socialLinks.website}
                  onChange={(e) => setSocial('website', e.target.value)}
                  placeholder="https://yourwebsite.com"
                  className="pl-9"
                />
              </div>
            </FormField>
            <FormField label="Facebook">
              <div className="relative">
                <FiGlobe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <TextInput
                  value={(form.socialLinks as any).facebook ?? ''}
                  onChange={(e) => setSocial('facebook' as any, e.target.value)}
                  placeholder="https://facebook.com/yourpage"
                  className="pl-9"
                />
              </div>
            </FormField>
          </div>
        </SectionCard>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-2">
          <Link href="/admin" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
            ← Back to dashboard
          </Link>
          <SaveButton state={saveState} />
        </div>

      </form>
    </div>
  );
}
