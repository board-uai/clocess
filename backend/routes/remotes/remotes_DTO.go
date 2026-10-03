package remotes

type AddRemoteDTO struct {
	Host      string `json:"host"`
	HostUser  string `json:"host_user"`
	HostPort  int32  `json:"host_port"`
	BasePath  string `json:"base_path"`
	PublicKey string `json:"public_key"`
}

type SetUpRemoteDTO struct {
	BasePath    string `json:"base_path"`
	MemoryLimit int32  `json:"memory_limit"`
}

type RemoteIDDTO struct {
	RemoteID int32 `json:"remote_id"`
}
