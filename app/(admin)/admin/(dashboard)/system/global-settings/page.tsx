import { getSystemSettings } from '@/app/actions/systemSettings';
import GlobalSettingsClient from './GlobalSettingsClient';
export const dynamic = 'force-dynamic';

export default async function GlobalSettingsPage() {
    const settings = await getSystemSettings();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">Global Settings</h1>
                <p className="text-sm text-gray-500">Manage system-wide configuration, limits, and behavior.</p>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden p-6 max-w-2xl">
                <GlobalSettingsClient initialSettings={settings} />
            </div>
        </div>
    );
}
