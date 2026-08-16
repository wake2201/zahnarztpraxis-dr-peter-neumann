import type { Metadata } from "next";
import { AppointmentAccessForm } from "@/components/appointments/appointment-access-form";
import { AppointmentManagement } from "@/components/appointments/appointment-management";
import { publicContent } from "@/content/data";
import { getManagedAppointment } from "@/lib/actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: publicContent.metadata.appointmentManagement.title,
  description: publicContent.metadata.appointmentManagement.description,
};

export default async function AppointmentManagementPage() {
  const managedAppointment = await getManagedAppointment();

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
      {managedAppointment.success
        ? <AppointmentManagement initialAppointment={managedAppointment.data} />
        : <AppointmentAccessForm />}
    </main>
  );
}
