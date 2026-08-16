import type { Metadata } from "next";
import { AppointmentWizard } from "@/components/appointments/appointment-wizard";
import { publicContent } from "@/content/data";
import { getPublicAppointmentTypes } from "@/lib/actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: publicContent.metadata.appointmentBooking.title,
  description: publicContent.metadata.appointmentBooking.description,
};

export default async function AppointmentBookingPage() {
  const appointmentTypes = await getPublicAppointmentTypes();

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
      <AppointmentWizard appointmentTypes={appointmentTypes} />
    </main>
  );
}
