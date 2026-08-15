/** Package-owned invariant companion for `@deepseek-ai/dsh-client-ui-tool-failures`. */
/* jscpd:ignore-start */
import type { Context } from '@deepseek-ai/cordis'
import type { InvariantInstaller } from '@deepseek-ai/dsh-invariants'

const PACKAGE_NAME = '@deepseek-ai/dsh-client-ui-tool-failures'

/** Cordis companion plugin name. */
export const name = 'client-ui-tool-failures-invariant'
/** Service required before the companion can reserve package ownership. */
export const inject = ['invariants']

/** No runtime invariant: this package only projects immutable session snapshot data into one disposable slot entry. */
const install: InvariantInstaller = () => {}

/** Reserve package ownership with the invariant registry. */
export const apply = (ctx: Context): Promise<() => void> =>
  Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install))
/* jscpd:ignore-end */
