export interface Config {
  /** Policies plugin configuration */
  policies?: {
    /**
     * Prefix of the kinds of policies to list: Kyverno's CEL policy types live in the API group `policies.kyverno.io`.
     * @default policies.kyverno.io
     */
    group?: string;
  };
}
