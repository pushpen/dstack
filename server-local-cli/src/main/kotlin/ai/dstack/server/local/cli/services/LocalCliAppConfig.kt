package ai.dstack.server.local.cli.services

import ai.dstack.server.services.AppConfig
import org.springframework.stereotype.Component

@Component
class LocalCliAppConfig : AppConfig {
    override val hostName: String
        get() {
            return System.getenv("dstack_host_name") ?: "localhost"
        }

    override val port: Int?
        get() {
            return System.getenv("dstack_port")?.toInt() ?: internalPort
        }

    override val internalPort: Int
        get() {
            return System.getenv("dstack_internal_port")?.toInt() ?: defaultInternalPort.toInt()
        }

    override val ssl: Boolean
        get() {
            return System.getenv("dstack_ssl")?.toBoolean() ?: false
        }

    override val address: String
        get() {
            val p = if (port == 80 && !ssl || port == 443 && ssl) "" else port!!
            return ((if (ssl) "https" else "http") + "://") + hostName + ":$p"
        }

    override val homeDirectory: String
        get() {
            val dir = defaultHomeDirectory ?: "."
            return System.getenv("dstack_home") ?: "$dir/.dstack"
        }

    override val dataDirectory: String
        get() {
            return "${homeDirectory}/data"
        }

    override val fileDirectory: String
        get() {
            return "${homeDirectory}/files"
        }

    override val supportEmail: String
        get() {
            return System.getenv("dstack_support_email")
        }

    override val smtpHost: String
        get() {
            return System.getenv("dstack_smtp_host")
        }

    override val smtpPort: Int
        get() {
            return System.getenv("dstack_smtp_port").toInt()
        }

    override val smtpUser: String?
        get() {
            return System.getenv("dstack_smtp_user")
        }

    override val smtpPassword: String?
        get() {
            return System.getenv("dstack_smtp_password")
        }

    override val smtpStartTLS: Boolean
        get() {
            return System.getenv("dstack_smtp_starttls")?.toBoolean() ?: true
        }

    override val smtpFrom: String
        get() {
            return System.getenv("dstack_smtp_from")
        }

    companion object {
        var defaultInternalPort: String = "8080"
        var defaultHomeDirectory: String? = System.getProperty("user.home")
    }
}