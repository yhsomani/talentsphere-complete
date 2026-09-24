export interface AuditEvent {
  id: string;
  eventName: string;
  actorId: string;
  targetId?: string;
  targetType?: string;
  tenantId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

export interface AuditSink {
  emit(event: AuditEvent): Promise<void>;
}

export class InMemoryAuditSink implements AuditSink {
  private events: AuditEvent[] = [];

  async emit(event: AuditEvent): Promise<void> {
    this.events.push(event);
  }

  getEvents(): readonly AuditEvent[] {
    return this.events;
  }

  clear(): void {
    this.events = [];
  }
}
