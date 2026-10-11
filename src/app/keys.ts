import type { InjectionKey, Ref } from 'vue'
import type { MenuItem } from '../shared/api/navigation'

export const navigationKey: InjectionKey<Ref<MenuItem[]>> = Symbol('workspace-navigation')
