import type { SubcategoryId } from '@/constants/naturalist-categories';

/**
 * Maps Postgres `species_category` (and legacy values) to a canonical subcategory id.
 */
export function mapDbCategoryToSubcategory(category: string): SubcategoryId | null {
  const c = category.trim().toLowerCase();

  const direct: Record<string, SubcategoryId> = {
    wildflowers: 'wildflowers',
    trees_shrubs: 'trees_shrubs',
    ferns_mosses: 'ferns_mosses',
    aquatic_plants: 'aquatic_plants',
    cacti_succulents: 'cacti_succulents',
    succulents_cacti: 'cacti_succulents',
    flowers: 'wildflowers',
    trees: 'trees_shrubs',
    shrubs: 'trees_shrubs',
    ferns: 'ferns_mosses',
    mosses_lichens: 'ferns_mosses',
    grasses_sedges: 'wildflowers',
    vines: 'trees_shrubs',
    plant_tree: 'trees_shrubs',
    plant_flower: 'wildflowers',
    plant_other: 'trees_shrubs',
    lizards: 'lizards',
    snakes: 'snakes',
    frogs_toads: 'frogs_toads',
    turtles_tortoises: 'turtles_tortoises',
    salamanders: 'salamanders',
    songbirds: 'songbirds',
    raptors: 'raptors',
    wading_birds: 'wading_birds',
    waterfowl: 'waterfowl',
    shorebirds: 'shorebirds',
    small_mammals: 'small_mammals',
    deer_hoofed: 'deer_hoofed',
    bats: 'bats',
    marine_mammals: 'marine_mammals',
    carnivores: 'carnivores',
    mammal: 'small_mammals',
    reptile: 'lizards',
    amphibian: 'frogs_toads',
    bird: 'songbirds',
    insect: 'other_insects',
    fish: 'freshwater_fish',
    butterflies_moths: 'butterflies_moths',
    beetles: 'beetles',
    bees_wasps: 'bees_wasps',
    dragonflies: 'dragonflies',
    other_insects: 'other_insects',
    spiders: 'spiders',
    scorpions: 'scorpions',
    ticks_mites: 'ticks_mites',
    other_arachnids: 'other_arachnids',
    freshwater_fish: 'freshwater_fish',
    saltwater_fish: 'saltwater_fish',
    shellfish: 'shellfish',
    other_fish: 'other_fish',
    mushrooms: 'mushrooms',
    slime_molds: 'slime_molds',
    lichens: 'lichens',
    other_fungi: 'other_fungi',
    other: 'other_fungi',
  };

  return direct[c] ?? null;
}
