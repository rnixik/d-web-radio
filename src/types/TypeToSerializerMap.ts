import { PayloadSerializer } from '@/types/PayloadSerializer'

export interface TypeToSerializerMap {
  [type: string]: PayloadSerializer
}
