import { createFileRoute } from '@tanstack/react-router';
import { PageShell } from '@/components/PageShell';
import { SavedPageContent } from '@/components/MobileApp';
import { seoHead } from '@/lib/seo';
export const Route = createFileRoute('/saved')({ head: ({ match }) => seoHead(match, { title: { en: 'Saved stories — AI Broadsheet', fr: 'Articles enregistrés — AI Broadsheet' }, description: { en: 'Your personal reading list, saved on this device.', fr: 'Votre liste de lecture, sur cet appareil.' }, noindex: true }), component: () => <PageShell><SavedPageContent /></PageShell> });
