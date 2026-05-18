import type { ComponentType } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import {
  ArrowPathIcon,
  Bars3Icon,
  BoltIcon,
  BoltSlashIcon,
  CameraIcon,
  ChartBarSquareIcon,
  CheckCircleIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  EllipsisHorizontalIcon,
  EyeIcon,
  EyeSlashIcon,
  FunnelIcon,
  LightBulbIcon,
  ListBulletIcon,
  LockClosedIcon,
  MagnifyingGlassIcon,
  PhotoIcon,
  RectangleStackIcon,
  Squares2X2Icon,
  TrashIcon,
  TrophyIcon,
  UserIcon,
  XMarkIcon,
} from 'react-native-heroicons/outline';
import {
  CameraIcon as CameraIconSolid,
  TrophyIcon as TrophyIconSolid,
  UserIcon as UserIconSolid,
} from 'react-native-heroicons/solid';

export type HeroIconName =
  | 'arrow-path'
  | 'bars-3'
  | 'bolt'
  | 'bolt-slash'
  | 'camera'
  | 'chart-bar'
  | 'check'
  | 'check-circle'
  | 'chevron-down'
  | 'chevron-right'
  | 'ellipsis-horizontal'
  | 'eye'
  | 'eye-slash'
  | 'funnel'
  | 'light-bulb'
  | 'list-bullet'
  | 'lock-closed'
  | 'magnifying-glass'
  | 'photo'
  | 'rectangle-stack'
  | 'squares-2x2'
  | 'trash'
  | 'trophy'
  | 'user'
  | 'x-mark';

export type HeroIconVariant = 'outline' | 'solid';

type IconComponent = ComponentType<{
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}>;

const OUTLINE: Record<HeroIconName, IconComponent> = {
  'arrow-path': ArrowPathIcon,
  'bars-3': Bars3Icon,
  bolt: BoltIcon,
  'bolt-slash': BoltSlashIcon,
  camera: CameraIcon,
  'chart-bar': ChartBarSquareIcon,
  check: CheckIcon,
  'check-circle': CheckCircleIcon,
  'chevron-down': ChevronDownIcon,
  'chevron-right': ChevronRightIcon,
  'ellipsis-horizontal': EllipsisHorizontalIcon,
  eye: EyeIcon,
  'eye-slash': EyeSlashIcon,
  funnel: FunnelIcon,
  'light-bulb': LightBulbIcon,
  'list-bullet': ListBulletIcon,
  'lock-closed': LockClosedIcon,
  'magnifying-glass': MagnifyingGlassIcon,
  photo: PhotoIcon,
  'rectangle-stack': RectangleStackIcon,
  'squares-2x2': Squares2X2Icon,
  trash: TrashIcon,
  trophy: TrophyIcon,
  user: UserIcon,
  'x-mark': XMarkIcon,
};

const SOLID_OVERRIDES: Partial<Record<HeroIconName, IconComponent>> = {
  camera: CameraIconSolid,
  trophy: TrophyIconSolid,
  user: UserIconSolid,
};

export type HeroIconProps = {
  name: HeroIconName;
  size?: number;
  color: string;
  variant?: HeroIconVariant;
  style?: StyleProp<ViewStyle>;
};

export function HeroIcon({ name, size = 24, color, variant = 'outline', style }: HeroIconProps) {
  const Icon =
    variant === 'solid' && SOLID_OVERRIDES[name]
      ? SOLID_OVERRIDES[name]!
      : OUTLINE[name];
  return <Icon size={size} color={color} style={style} />;
}

/** Legacy tab / navigation names → Heroicons. */
export type IconSymbolName =
  | 'camera.fill'
  | 'person.fill'
  | 'trophy.fill'
  | 'line.3.horizontal'
  | 'square.grid.2x2'
  | 'chevron.right';

const SYMBOL_MAP: Record<
  IconSymbolName,
  { name: HeroIconName; variant?: HeroIconVariant }
> = {
  'camera.fill': { name: 'camera', variant: 'solid' },
  'person.fill': { name: 'user', variant: 'solid' },
  'trophy.fill': { name: 'trophy', variant: 'solid' },
  'line.3.horizontal': { name: 'bars-3' },
  'square.grid.2x2': { name: 'squares-2x2' },
  'chevron.right': { name: 'chevron-right' },
};

export function HeroIconFromSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string;
  style?: StyleProp<ViewStyle>;
}) {
  const mapped = SYMBOL_MAP[name];
  return (
    <HeroIcon
      name={mapped.name}
      size={size}
      color={color}
      variant={mapped.variant}
      style={style}
    />
  );
}
