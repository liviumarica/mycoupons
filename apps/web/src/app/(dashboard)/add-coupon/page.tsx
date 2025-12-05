import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AddCouponForm from './AddCouponForm';
import PageTransition from '@/components/PageTransition';

export default async function AddCouponPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between items-center">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-gray-900">
                  Add Coupon
                </h1>
              </div>
            </div>
          </div>
        </nav>

        <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <AddCouponForm />
        </main>
      </div>
    </PageTransition>
  );
}
