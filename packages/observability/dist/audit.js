export class InMemoryAuditSink {
    events = [];
    async emit(event) {
        this.events.push(event);
    }
    getEvents() {
        return this.events;
    }
    clear() {
        this.events = [];
    }
}
//# sourceMappingURL=audit.js.map