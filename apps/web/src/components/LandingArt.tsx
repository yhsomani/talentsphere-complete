import React from 'react';
import { colors, typography } from '@talentsphere/ui';

/*
 * Landing-page illustrations. They are drawn, not photographed: every picture
 * shows a real step of the product (a role, a code sent to a work email, a
 * manager's confirmation, the recruiter's view) in the seal vocabulary the app
 * already uses: dashed ring = not confirmed, single = work email, double =
 * also vouched for. Colours come from the design tokens.
 */

const INK = colors.neutral[900];
const SPRUCE = colors.primary[700];
const PAPER = colors.surface.card;
const LINE = colors.neutral[300];
const SOFT = colors.neutral[200];
const AMBER = colors.semantic.warning;

type ArtProps = { className?: string };

const Frame: React.FC<{
  label: string;
  viewBox: string;
  className?: string;
  children: React.ReactNode;
}> = ({ label, className, viewBox, children }) => (
  <svg
    role="img"
    aria-label={label}
    viewBox={viewBox}
    className={className}
    style={{ display: 'block', width: '100%', height: 'auto' }}
    fontFamily={typography.fontFamily.sans}
  >
    {children}
  </svg>
);

const Sheet: React.FC<{ x: number; y: number; w: number; h: number; tilt?: number }> = ({
  x,
  y,
  w,
  h,
  tilt = 0,
}) => (
  <g transform={`rotate(${tilt} ${x + w / 2} ${y + h / 2})`}>
    <rect x={x + 3} y={y + 5} width={w} height={h} rx="4" fill={INK} opacity="0.08" />
    <rect x={x} y={y} width={w} height={h} rx="4" fill={PAPER} stroke={LINE} strokeWidth="1.5" />
  </g>
);

const Bars: React.FC<{ x: number; y: number; widths: number[]; gap?: number }> = ({
  x,
  y,
  widths,
  gap = 14,
}) => (
  <>
    {widths.map((w, i) => (
      <rect key={i} x={x} y={y + i * gap} width={w} height="5" rx="2.5" fill={SOFT} />
    ))}
  </>
);

/** Seal at any position: 0 = dashed, 1 = single ring, 2 = double ring; both confirmed states carry a tick. */
const Seal: React.FC<{ cx: number; cy: number; r: number; level: 0 | 1 | 2; draw?: boolean }> = ({
  cx,
  cy,
  r,
  level,
  draw = false,
}) => {
  const stroke = level === 0 ? colors.neutral[500] : SPRUCE;
  const circumference = 2 * Math.PI * r;
  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill={PAPER}
        stroke={stroke}
        strokeWidth={r / 7}
        strokeDasharray={level === 0 ? `${r / 3} ${r / 4}` : draw ? circumference : undefined}
        className={draw ? 'landing-ring-draw' : undefined}
        style={draw ? ({ '--ring-length': circumference } as React.CSSProperties) : undefined}
      />
      {level === 2 && (
        <circle
          cx={cx}
          cy={cy}
          r={r * 0.72}
          fill="none"
          stroke={SPRUCE}
          strokeWidth={r / 9}
          className={draw ? 'landing-ring-inner' : undefined}
        />
      )}
      {level > 0 && (
        <path
          d={`M ${cx - r * 0.3} ${cy + r * 0.02} l ${r * 0.2} ${r * 0.22} l ${r * 0.4} ${-r * 0.44}`}
          fill="none"
          stroke={SPRUCE}
          strokeWidth={r / 6}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={draw ? 'landing-ring-tick' : undefined}
        />
      )}
    </g>
  );
};

const Score: React.FC<{ x: number; y: number; value: number }> = ({ x, y, value }) => (
  <text
    x={x}
    y={y}
    textAnchor="end"
    fontFamily={typography.fontFamily.mono}
    fontSize="13"
    fill={colors.neutral[700]}
  >
    {value} / 100
  </text>
);

/** Hero: one work-history record with its proof slips; the stamp draws itself once. */
export const HeroRecordArt: React.FC<ArtProps> = ({ className }) => (
  <Frame
    className={className}
    viewBox="0 0 520 440"
    label="A work-history record for a Platform Engineer, with a confirmed work email and a manager's vouch still pending"
  >
    <rect x="12" y="20" width="496" height="400" rx="6" fill={colors.surface.subtle} />
    <Sheet x={64} y={56} w={330} h={300} tilt={-1.5} />
    <text x="92" y="100" fontFamily={typography.fontFamily.serif} fontSize="26" fill={INK}>
      Platform Engineer
    </text>
    <text x="92" y="124" fontSize="14" fill={colors.neutral[600]}>
      Northwind · 2021 – 2024
    </text>
    <Bars x={92} y={150} widths={[250, 210, 232, 140]} gap={16} />
    <line x1="92" y1="232" x2="364" y2="232" stroke={LINE} strokeWidth="1.5" />
    <Seal cx={118} cy={274} r={20} level={1} />
    <text x="148" y="271" fontSize="14" fontWeight="600" fill={INK}>
      Work email confirmed
    </text>
    <text x="148" y="290" fontSize="12" fill={colors.neutral[600]}>
      Code entered from an @northwind address
    </text>
    <Score x={364} y={274} value={40} />
    <Seal cx={118} cy={326} r={20} level={0} />
    <text x="148" y="323" fontSize="14" fontWeight="600" fill={INK}>
      Manager vouch
    </text>
    <text x="148" y="342" fontSize="12" fill={colors.neutral[600]}>
      Waiting for a reply
    </text>

    <g className="landing-stamp">
      <Seal cx={404} cy={96} r={52} level={2} draw />
    </g>

    <g transform="rotate(4 440 300)">
      <rect
        x="388"
        y="236"
        width="104"
        height="132"
        rx="4"
        fill={PAPER}
        stroke={LINE}
        strokeWidth="1.5"
      />
      <rect
        x="400"
        y="250"
        width="80"
        height="30"
        rx="3"
        fill={colors.primary[50]}
        stroke={colors.primary[200]}
      />
      <text
        x="440"
        y="270"
        textAnchor="middle"
        fontFamily={typography.fontFamily.mono}
        fontSize="14"
        fill={SPRUCE}
      >
        482 913
      </text>
      <Bars x={400} y={296} widths={[76, 60, 70]} gap={14} />
    </g>
  </Frame>
);

/** Step 1: a role has just been added and nothing is confirmed. */
export const StepRoleArt: React.FC<ArtProps> = ({ className }) => (
  <Frame
    className={className}
    viewBox="0 0 320 200"
    label="A newly added role with a dashed seal, meaning not confirmed yet"
  >
    <rect width="320" height="200" rx="4" fill={colors.surface.subtle} />
    <Sheet x={36} y={30} w={248} h={140} />
    <text x="56" y="66" fontFamily={typography.fontFamily.serif} fontSize="19" fill={INK}>
      Platform Engineer
    </text>
    <text x="56" y="86" fontSize="12" fill={colors.neutral[600]}>
      Northwind · 2021 – 2024
    </text>
    <Bars x={56} y={106} widths={[170, 130]} />
    <Seal cx={252} cy={134} r={17} level={0} />
    <Score x={226} y={139} value={0} />
  </Frame>
);

/** Step 2: the one-time code sent to the employer's mail domain. */
export const StepEmailArt: React.FC<ArtProps> = ({ className }) => (
  <Frame
    className={className}
    viewBox="0 0 320 200"
    label="An email to an employer address containing a six-digit one-time code, and a confirmed seal"
  >
    <rect width="320" height="200" rx="4" fill={colors.surface.subtle} />
    <Sheet x={36} y={28} w={248} h={144} />
    <rect
      x="36"
      y="28"
      width="248"
      height="34"
      rx="4"
      fill={colors.primary[50]}
      stroke={LINE}
      strokeWidth="1.5"
    />
    <text
      x="52"
      y="50"
      fontFamily={typography.fontFamily.mono}
      fontSize="12"
      fill={colors.neutral[700]}
    >
      you@northwind.example
    </text>
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <g key={i}>
        <rect
          x={52 + i * 33}
          y="80"
          width="27"
          height="36"
          rx="3"
          fill={PAPER}
          stroke={SPRUCE}
          strokeWidth="1.5"
        />
        <text
          x={65.5 + i * 33}
          y="104"
          textAnchor="middle"
          fontFamily={typography.fontFamily.mono}
          fontSize="18"
          fill={INK}
        >
          {'482913'[i]}
        </text>
      </g>
    ))}
    <Bars x={52} y={136} widths={[120, 88]} />
    <Seal cx={250} cy={144} r={17} level={1} />
  </Frame>
);

/** Step 3: a manager's private-link confirmation with a rating. */
export const StepReferenceArt: React.FC<ArtProps> = ({ className }) => (
  <Frame
    className={className}
    viewBox="0 0 320 200"
    label="A manager's confirmation of title and dates with a four-out-of-five rating, and a double seal"
  >
    <rect width="320" height="200" rx="4" fill={colors.surface.subtle} />
    <Sheet x={36} y={26} w={248} h={148} />
    <text x="56" y="56" fontSize="12" fontWeight="600" fill={INK}>
      Title and dates are correct
    </text>
    <rect x="56" y="66" width="14" height="14" rx="2" fill={SPRUCE} />
    <path
      d="M 59 73 l 3 3 l 6 -7"
      fill="none"
      stroke={PAPER}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Bars x={80} y={70} widths={[120]} />
    <text x="56" y="106" fontSize="12" fill={colors.neutral[600]}>
      Quality of work
    </text>
    {[0, 1, 2, 3, 4].map((i) => (
      <circle
        key={i}
        cx={64 + i * 22}
        cy="124"
        r="8"
        fill={i < 4 ? AMBER : 'none'}
        stroke={AMBER}
        strokeWidth="1.5"
      />
    ))}
    <path
      d="M 56 158 q 14 -16 28 0 t 28 0"
      fill="none"
      stroke={INK}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <Seal cx={248} cy={136} r={22} level={2} />
  </Frame>
);

/** Candidate side: where an application stands. */
export const CandidateArt: React.FC<ArtProps> = ({ className }) => (
  <Frame
    className={className}
    viewBox="0 0 420 260"
    label="An application moving through four stages: applied, in review, interview, offer"
  >
    <rect width="420" height="260" rx="6" fill={colors.surface.subtle} />
    <Sheet x={28} y={28} w={364} h={204} />
    <text x="52" y="64" fontFamily={typography.fontFamily.serif} fontSize="20" fill={INK}>
      Senior Platform Engineer
    </text>
    <text x="52" y="84" fontSize="12" fill={colors.neutral[600]}>
      Applied with 2 confirmed roles
    </text>
    <line x1="68" y1="140" x2="352" y2="140" stroke={LINE} strokeWidth="2" />
    <line x1="68" y1="140" x2="163" y2="140" stroke={SPRUCE} strokeWidth="3" />
    {[
      { name: 'Applied', x: 68, done: true },
      { name: 'In review', x: 163, done: true },
      { name: 'Interview', x: 257, done: false },
      { name: 'Offer', x: 352, done: false },
    ].map(({ name, x, done }) => (
      <g key={name}>
        <circle
          cx={x}
          cy="140"
          r="9"
          fill={done ? SPRUCE : PAPER}
          stroke={done ? SPRUCE : colors.neutral[500]}
          strokeWidth="2"
        />
        <text
          x={x}
          y="172"
          textAnchor="middle"
          fontSize="12"
          fill={done ? INK : colors.neutral[600]}
        >
          {name}
        </text>
      </g>
    ))}
    <Bars x={52} y={196} widths={[190]} />
  </Frame>
);

/** Recruiter side: applicants with the seal showing how their roles were proven. */
export const RecruiterArt: React.FC<ArtProps> = ({ className }) => (
  <Frame
    className={className}
    viewBox="0 0 420 260"
    label="A recruiter's applicant list where each person shows a seal for how their roles were confirmed"
  >
    <rect width="420" height="260" rx="6" fill={colors.surface.subtle} />
    <Sheet x={28} y={28} w={364} h={204} />
    <text x="52" y="60" fontFamily={typography.fontFamily.serif} fontSize="18" fill={INK}>
      Applicants
    </text>
    {[
      { how: 'Vouched for by a manager', level: 2 as const, score: 80, bar: 150 },
      { how: 'Work email confirmed', level: 1 as const, score: 40, bar: 118 },
      { how: 'Not confirmed yet', level: 0 as const, score: 0, bar: 90 },
    ].map(({ how, level, score, bar }, i) => (
      <g key={how}>
        <line x1="52" y1={78 + i * 50} x2="368" y2={78 + i * 50} stroke={SOFT} strokeWidth="1.5" />
        <circle cx="68" cy={106 + i * 50} r="11" fill={colors.neutral[300]} />
        <rect x="90" y={96 + i * 50} width={bar} height="6" rx="3" fill={colors.neutral[400]} />
        <text x="90" y={118 + i * 50} fontSize="11" fill={colors.neutral[600]}>
          {how}
        </text>
        <Seal cx={278} cy={104 + i * 50} r={13} level={level} />
        <Score x={368} y={109 + i * 50} value={score} />
      </g>
    ))}
  </Frame>
);
