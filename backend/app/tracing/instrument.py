from app.config import settings


class TracingService:
    def __init__(self):
        self.enabled = bool(settings.phoenix_api_key)
        self.tracer_provider = None
        self._setup()

    def _setup(self):
        if not self.enabled:
            return
        try:
            from openinference.instrumentation.llama_index import LlamaIndexInstrumentor
            from phoenix.otel import register

            self.tracer_provider = register(
                project_name="lifeops",
                endpoint=f"http://{settings.phoenix_host}:{settings.phoenix_port}",
                api_key=settings.phoenix_api_key,
            )
            LlamaIndexInstrumentor().instrument(tracer_provider=self.tracer_provider)
        except Exception:
            self.enabled = False

    def get_trace_id(self) -> str:
        import uuid
        return str(uuid.uuid4())

    async def record_span(
        self,
        trace_id: str,
        span_name: str,
        span_type: str,
        attributes: dict,
        parent_span_id: str = None,
    ):
        if not self.enabled:
            return
        from opentelemetry import trace
        from opentelemetry.trace import SpanKind

        tracer = self.tracer_provider.get_tracer("lifeops")
        with tracer.start_as_current_span(
            span_name,
            kind=SpanKind.INTERNAL,
            attributes={**attributes, "trace_id": trace_id, "span_type": span_type},
        ) as span:
            if parent_span_id:
                span.set_attribute("parent_span_id", parent_span_id)

    async def log_llm_call(
        self,
        trace_id: str,
        model: str,
        prompt: str,
        response: str,
        latency_ms: float,
        token_count: int,
    ):
        if not self.enabled:
            return
        from opentelemetry import trace
        tracer = self.tracer_provider.get_tracer("lifeops")
        with tracer.start_as_current_span("llm_call") as span:
            span.set_attribute("trace_id", trace_id)
            span.set_attribute("llm.model", model)
            span.set_attribute("llm.prompt_length", len(prompt))
            span.set_attribute("llm.response_length", len(response))
            span.set_attribute("llm.latency_ms", latency_ms)
            span.set_attribute("llm.token_count", token_count)

    async def log_feedback(self, trace_id: str, score: float, feedback: str):
        if not self.enabled:
            return
        from opentelemetry import trace
        tracer = self.tracer_provider.get_tracer("lifeops")
        with tracer.start_as_current_span("feedback") as span:
            span.set_attribute("trace_id", trace_id)
            span.set_attribute("feedback.score", score)
            span.set_attribute("feedback.text", feedback)

    async def log_tool_call(
        self,
        trace_id: str,
        tool_name: str,
        input_data: dict,
        output_data: dict,
        latency_ms: float,
    ):
        if not self.enabled:
            return
        from opentelemetry import trace
        tracer = self.tracer_provider.get_tracer("lifeops")
        with tracer.start_as_current_span(f"tool_{tool_name}") as span:
            span.set_attribute("trace_id", trace_id)
            span.set_attribute("tool.name", tool_name)
            span.set_attribute("tool.latency_ms", latency_ms)
