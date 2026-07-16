export interface HeroContent {
  eyebrow: string
  name: string
  subtitle: string
  tagline: string
  meta: readonly string[]
}

export interface CapabilityItem {
  name: string
  desc: string
}

export interface CapabilityGroup {
  label: string
  items: readonly CapabilityItem[]
}

export interface CapabilitiesContent {
  eyebrow: string
  title: string
  subtitle: string
  groups: readonly CapabilityGroup[]
}

/** `frontier` = el más capaz de la familia (Fable 5), por encima del tier flagship. */
export type ModelTier = 'frontier' | 'flagship' | 'balanced' | 'fast'

export interface ModelTierItem {
  name: string
  tier: ModelTier
  context: string
  for: string
}

/** Niveles reales de `output_config.effort`. El default es `high`. */
export type EffortLevel = 'low' | 'medium' | 'high' | 'xhigh' | 'max'

export interface EffortItem {
  level: EffortLevel
  when: string
}

export interface ModelsContent {
  eyebrow: string
  title: string
  subtitle: string
  tiers: readonly ModelTierItem[]
  effort: readonly EffortItem[]
  caption: string
}

export interface ContextMetric {
  value: string
  label: string
}

export interface ContextContent {
  eyebrow: string
  title: string
  subtitle: string
  metrics: readonly ContextMetric[]
  rules: readonly string[]
}

export interface ExtendItem {
  name: string
  desc: string
  /** Dónde vive: ruta de config, archivo o llamada. Se pinta en mono. */
  hint: string
}

export interface ExtendContent {
  eyebrow: string
  title: string
  subtitle: string
  items: readonly ExtendItem[]
  caption: string
}

export interface HowItWorksStep {
  n: string
  title: string
  desc: string
}

export interface HowItWorksContent {
  eyebrow: string
  title: string
  subtitle: string
  steps: readonly HowItWorksStep[]
  caption: string
}

export interface FaqItem {
  q: string
  a: string
}

export interface FaqContent {
  eyebrow: string
  title: string
  subtitle: string
  items: readonly FaqItem[]
}

export interface LinksContent {
  docs: string
  github: string
  site: string
}

export interface Content {
  hero: HeroContent
  capabilities: CapabilitiesContent
  models: ModelsContent
  context: ContextContent
  extend: ExtendContent
  howItWorks: HowItWorksContent
  faq: FaqContent
  links: LinksContent
}
