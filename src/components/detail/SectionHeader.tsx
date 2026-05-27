interface Props {
  title: string;
  /** Tailwind 텍스트 사이즈 클래스. 메인 섹션은 `text-lg`, 사이드바 등 보조 영역은 `text-base` */
  size?: 'text-lg' | 'text-base';
  /** 외부 spacing 등을 위한 추가 클래스 */
  className?: string;
}

/**
 * DetailPage 섹션 헤딩의 공통 마크업.
 * 좌측 brand-blue 세로 막대(2x20) + h2 타이틀로 일관된 시각 정체성을 갖는다.
 */
const SectionHeader = ({ title, size = 'text-lg', className = '' }: Props) => (
  <div className={`flex items-center gap-2.5 ${className}`}>
    <span className="w-[2px] h-5 bg-blue-600 shrink-0" />
    <h2 className={`${size} font-bold text-slate-900 tracking-tight`}>{title}</h2>
  </div>
);

export default SectionHeader;
