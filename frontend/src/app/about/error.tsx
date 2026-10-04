"use client";
import { PageHeader } from "@/csmju";
import { ErrorState } from "@/components/common/ui-feedback";
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="space-y-4">
      <PageHeader
        title="เกิดข้อผิดพลาด"
        description="ลองโหลดข้อมูลอีกครั้ง หากยังมีปัญหา กรุณาติดต่อผู้ดูแล"
      />
      <ErrorState error={error} onRetry={reset} />
    </div>
  );
}
