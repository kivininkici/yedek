import ModernAdminLayout from '@/components/admin/ModernAdminLayout';

export default function ApiManagement() {
  return (
    <ModernAdminLayout title="API Yönetimi">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-50">API Yönetimi</h2>
            <p className="text-slate-400">Harici API'lerden servis içe aktarın ve yönetin</p>
          </div>
        </div>
        
        <div className="text-center text-slate-400 mt-8">
          API Management sayfası geçici olarak basitleştirilmiştir.
        </div>
      </div>
    </ModernAdminLayout>
  );
}