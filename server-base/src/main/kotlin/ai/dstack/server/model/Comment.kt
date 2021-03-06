package ai.dstack.server.model

data class Comment(
    val id: String,
    val stackPath: String,
    val userName: String,
    val timestampMillis: Long,
    val text: String
)