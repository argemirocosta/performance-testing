FROM eclipse-temurin:21-jre

ARG JMETER_VERSION=5.6.3
ARG JMETER_SHA512=5978a1a35edb5a7d428e270564ff49d2b1b257a65e17a759d259a9283fc17093e522fe46f474a043864aea6910683486340706d745fcdf3db1505fd71e689083
ARG PROMETHEUS_PLUGIN_VERSION=0.7.1

ENV JMETER_HOME=/opt/apache-jmeter-${JMETER_VERSION}
ENV PATH="${JMETER_HOME}/bin:${PATH}"

RUN curl -fsSL -o /tmp/jmeter.tgz \
      "https://archive.apache.org/dist/jmeter/binaries/apache-jmeter-${JMETER_VERSION}.tgz" \
 && echo "${JMETER_SHA512}  /tmp/jmeter.tgz" | sha512sum -c - \
 && tar -xzf /tmp/jmeter.tgz -C /opt \
 && rm /tmp/jmeter.tgz \
 && rm -rf "${JMETER_HOME}/docs" "${JMETER_HOME}/printable_docs" \
 && curl -fsSL -o "${JMETER_HOME}/lib/ext/jmeter-prometheus-plugin-${PROMETHEUS_PLUGIN_VERSION}.jar" \
      "https://github.com/johrstrom/jmeter-prometheus-plugin/releases/download/${PROMETHEUS_PLUGIN_VERSION}/jmeter-prometheus-plugin-${PROMETHEUS_PLUGIN_VERSION}.jar"

# Prometheus plugin /metrics endpoint
EXPOSE 9270

WORKDIR /tests
ENTRYPOINT ["jmeter"]
