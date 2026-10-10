import { createFileRoute } from '@tanstack/react-router';
import { PageShell } from '@/components/PageShell';
import { MorePageContent } from '@/components/MobileApp';
import { seoHead } from '@/lib/seo';
export const Route = createFileRoute('/more')({ head: ({ match }) => seoHead(match, { title: { en: 'Your paper — AI Broadsheet', fr: 'Votre journal — AI Broadsheet' }, description: { en: 'Explore, install the app and personalise your reading.', fr: 'Explorer, installer et personnaliser votre lecture.' }, noindex: true }), component: () => <PageShell><MorePageContent /></PageShell> });
