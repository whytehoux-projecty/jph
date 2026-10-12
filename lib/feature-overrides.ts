export interface DepositMethodsOverrides {
  cash: boolean;
  virtual: boolean;
  check: boolean;
  card: boolean;
  crypto: boolean;
}

export interface LoanMethodsOverrides {
  auto: boolean;
  mortgage: boolean;
  personal: boolean;
  heloc: boolean;
  business: boolean;
}

export interface BenefitsMethodsOverrides {
  points_redemption: boolean;
  relationship_tiers: boolean;
  private_advisory: boolean;
  concierge: boolean;
}

export interface BillMethodsOverrides {
  providers: boolean;
  einvoice: boolean;
}

export interface UserFeatureOverrides {
  deposits: {
    enabled: boolean;
    methods: DepositMethodsOverrides;
  };
  loans: {
    enabled: boolean;
    methods: LoanMethodsOverrides;
  };
  benefits: {
    enabled: boolean;
    methods: BenefitsMethodsOverrides;
  };
  bills: {
    enabled: boolean;
    methods: BillMethodsOverrides;
  };
}

export const DEFAULT_FEATURE_OVERRIDES: UserFeatureOverrides = {
  deposits: {
    enabled: true,
    methods: {
      cash: true,
      virtual: true,
      check: true,
      card: true,
      crypto: true,
    },
  },
  loans: {
    enabled: true,
    methods: {
      auto: true,
      mortgage: true,
      personal: true,
      heloc: true,
      business: true,
    },
  },
  benefits: {
    enabled: true,
    methods: {
      points_redemption: true,
      relationship_tiers: true,
      private_advisory: true,
      concierge: true,
    },
  },
  bills: {
    enabled: true,
    methods: {
      providers: true,
      einvoice: true,
    },
  },
};

export function parseUserFeatureOverrides(overridesJson: string | null | undefined): UserFeatureOverrides {
  if (!overridesJson) {
    return JSON.parse(JSON.stringify(DEFAULT_FEATURE_OVERRIDES));
  }

  try {
    const parsed = JSON.parse(overridesJson);
    const fo = parsed.featureOverrides || {};

    return {
      deposits: {
        enabled: fo.deposits?.enabled !== false,
        methods: {
          cash: fo.deposits?.methods?.cash !== false,
          virtual: fo.deposits?.methods?.virtual !== false,
          check: fo.deposits?.methods?.check !== false,
          card: fo.deposits?.methods?.card !== false,
          crypto: fo.deposits?.methods?.crypto !== false,
        },
      },
      loans: {
        enabled: fo.loans?.enabled !== false,
        methods: {
          auto: fo.loans?.methods?.auto !== false,
          mortgage: fo.loans?.methods?.mortgage !== false,
          personal: fo.loans?.methods?.personal !== false,
          heloc: fo.loans?.methods?.heloc !== false,
          business: fo.loans?.methods?.business !== false,
        },
      },
      benefits: {
        enabled: fo.benefits?.enabled !== false,
        methods: {
          points_redemption: fo.benefits?.methods?.points_redemption !== false,
          relationship_tiers: fo.benefits?.methods?.relationship_tiers !== false,
          private_advisory: fo.benefits?.methods?.private_advisory !== false,
          concierge: fo.benefits?.methods?.concierge !== false,
        },
      },
      bills: {
        enabled: fo.bills?.enabled !== false,
        methods: {
          providers: fo.bills?.methods?.providers !== false,
          einvoice: fo.bills?.methods?.einvoice !== false,
        },
      },
    };
  } catch {
    return JSON.parse(JSON.stringify(DEFAULT_FEATURE_OVERRIDES));
  }
}

export function mergeFeatureOverridesIntoJson(
  currentJson: string | null | undefined,
  updatedFeatures: Partial<UserFeatureOverrides>
): string {
  let existing: Record<string, any> = {};
  if (currentJson) {
    try {
      existing = JSON.parse(currentJson);
    } catch {
      existing = {};
    }
  }

  const currentFeatures = parseUserFeatureOverrides(currentJson);

  const mergedFeatures: UserFeatureOverrides = {
    deposits: {
      enabled: updatedFeatures.deposits?.enabled ?? currentFeatures.deposits.enabled,
      methods: {
        ...currentFeatures.deposits.methods,
        ...(updatedFeatures.deposits?.methods || {}),
      },
    },
    loans: {
      enabled: updatedFeatures.loans?.enabled ?? currentFeatures.loans.enabled,
      methods: {
        ...currentFeatures.loans.methods,
        ...(updatedFeatures.loans?.methods || {}),
      },
    },
    benefits: {
      enabled: updatedFeatures.benefits?.enabled ?? currentFeatures.benefits.enabled,
      methods: {
        ...currentFeatures.benefits.methods,
        ...(updatedFeatures.benefits?.methods || {}),
      },
    },
    bills: {
      enabled: updatedFeatures.bills?.enabled ?? currentFeatures.bills.enabled,
      methods: {
        ...currentFeatures.bills.methods,
        ...(updatedFeatures.bills?.methods || {}),
      },
    },
  };

  existing.featureOverrides = mergedFeatures;
  return JSON.stringify(existing);
}
