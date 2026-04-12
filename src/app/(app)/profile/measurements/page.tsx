import { getBodyMeasurements } from "@/actions/measurements";
import { MeasurementsContent } from "@/components/workout/measurements-content";

export default async function MeasurementsPage() {
  const measurements = await getBodyMeasurements();
  return <MeasurementsContent measurements={measurements} />;
}
