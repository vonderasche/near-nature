import type {
  DiscoverAnimalSubcategoryId,
  DiscoverPlantSubcategoryId,
  DiscoverSpeciesSubcategoryId,
} from '@/lib/discover/discoverSpeciesSubcategories';
import type { DiscoverSpeciesKind } from '@/types/discover-species';

type NameRule = {
  id: DiscoverSpeciesSubcategoryId;
  patterns: readonly RegExp[];
};

const ANIMAL_RULES: readonly NameRule[] = [
  { id: 'snakes', patterns: [/snake/i, /watersnake/i, /cottonmouth/i, /moccasin/i] },
  { id: 'lizards', patterns: [/lizard/i, /anole/i, /skink/i, /gecko/i, /iguana/i, /agama/i] },
  { id: 'frogs_toads', patterns: [/frog/i, /toad/i] },
  {
    id: 'turtles_tortoises',
    patterns: [/turtle/i, /tortoise/i, /terrapin/i, /gopher tortoise/i],
  },
  { id: 'salamanders', patterns: [/salamander/i, /newt/i] },
  { id: 'raptors', patterns: [/hawk/i, /eagle/i, /owl/i, /falcon/i, /vulture/i, /osprey/i, /kite/i] },
  {
    id: 'wading_birds',
    patterns: [/heron/i, /egret/i, /ibis/i, /stork/i, /crane/i, /spoonbill/i, /bittern/i, /rail/i],
  },
  { id: 'waterfowl', patterns: [/duck/i, /goose/i, /swan/i, /teal/i, /merganser/i, /coot/i] },
  {
    id: 'shorebirds',
    patterns: [/plover/i, /sandpiper/i, /curlew/i, /avocet/i, /oystercatcher/i, /gull/i, /tern/i, /skimmer/i],
  },
  {
    id: 'songbirds',
    patterns: [
      /bird/i,
      /warbler/i,
      /sparrow/i,
      /cardinal/i,
      /wren/i,
      /titmouse/i,
      /mockingbird/i,
      /woodpecker/i,
      /flycatcher/i,
      /thrush/i,
      /robin/i,
      /bluebird/i,
      /finch/i,
      /grackle/i,
      /crow/i,
      /jay/i,
    ],
  },
  {
    id: 'fish',
    patterns: [/fish/i, /grunt/i, /snapper/i, /bass/i, /trout/i, /gar/i, /shark/i, /ray/i, /mullet/i, /tarpon/i],
  },
  {
    id: 'insects',
    patterns: [
      /butterfly/i,
      /moth/i,
      /dragonfly/i,
      /damselfly/i,
      /bee/i,
      /wasp/i,
      /ant/i,
      /beetle/i,
      /spider/i,
      /orbweaver/i,
      /grasshopper/i,
      /cicada/i,
      /insect/i,
    ],
  },
  { id: 'marine_mammals', patterns: [/dolphin/i, /manatee/i, /whale/i, /seal/i] },
  { id: 'bats', patterns: [/\bbat\b/i, /bats/i] },
  { id: 'deer_hoofed', patterns: [/deer/i, /elk/i] },
  {
    id: 'small_mammals',
    patterns: [/squirrel/i, /rabbit/i, /raccoon/i, /opossum/i, /mouse/i, /rat/i, /chipmunk/i],
  },
  { id: 'carnivores', patterns: [/bobcat/i, /panther/i, /cougar/i, /coyote/i, /fox/i, /bear/i] },
];

const PLANT_RULES: readonly NameRule[] = [
  {
    id: 'wildflowers',
    patterns: [/flower/i, /bloom/i, /violet/i, /milkweed/i, /milkwort/i, /azalea/i, /bluet/i, /sorrel/i, /clover/i],
  },
  {
    id: 'trees_shrubs',
    patterns: [
      /oak/i,
      /pine/i,
      /palm/i,
      /mangrove/i,
      /shrub/i,
      / tree/i,
      /^tree/i,
      /maple/i,
      /magnolia/i,
      /holly/i,
      /cypress/i,
      /cedar/i,
      /bay/i,
      /willow/i,
      /buttonwood/i,
      /gumbo/i,
      /palmetto/i,
    ],
  },
  { id: 'ferns_mosses', patterns: [/fern/i, /moss/i, /lichen/i, /clubmoss/i] },
  {
    id: 'aquatic_plants',
    patterns: [/aquatic/i, /pond/i, /marsh/i, /lily/i, /pickerel/i, /water /i, /sea /i, /mangrove/i],
  },
];

function matchRules(name: string, rules: readonly NameRule[]): DiscoverSpeciesSubcategoryId | null {
  for (const rule of rules) {
    if (rule.patterns.some((pattern) => pattern.test(name))) {
      return rule.id;
    }
  }
  return null;
}

export function inferDiscoverSpeciesSubcategory(
  name: string,
  kind: DiscoverSpeciesKind,
): DiscoverSpeciesSubcategoryId {
  const trimmed = name.trim();
  if (!trimmed) {
    return kind === 'plant' ? 'other_plants' : 'other_animals';
  }

  if (kind === 'plant') {
    return (matchRules(trimmed, PLANT_RULES) as DiscoverPlantSubcategoryId | null) ?? 'other_plants';
  }

  return (matchRules(trimmed, ANIMAL_RULES) as DiscoverAnimalSubcategoryId | null) ?? 'other_animals';
}
