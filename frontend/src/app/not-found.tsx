import { EmptyState } from "@/components/ui/EmptyState";

export default function NotFound() {
  return (
    <EmptyState
      title="페이지를 찾을 수 없습니다"
      description="요청하신 페이지가 없습니다. 홈에서 다시 시작해 주세요."
    />
  );
}
