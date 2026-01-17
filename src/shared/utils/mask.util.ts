/**
 * 문자열을 마스킹 처리합니다.
 * @param value 마스킹할 문자열
 * @param visibleStart 앞에서 보여줄 문자 수 (기본값: 2)
 * @param visibleEnd 뒤에서 보여줄 문자 수 (기본값: 2)
 * @returns 마스킹된 문자열 (예: "testuser123" → "te*****23")
 */
export function maskString(
  value: string,
  visibleStart = 2,
  visibleEnd = 2,
): string {
  if (!value) return '';

  const length = value.length;

  // 문자열이 너무 짧으면 전체 마스킹
  if (length <= visibleStart + visibleEnd) {
    return '*'.repeat(length);
  }

  const start = value.substring(0, visibleStart);
  const end = value.substring(length - visibleEnd);
  const masked = '*'.repeat(length - visibleStart - visibleEnd);

  return `${start}${masked}${end}`;
}
