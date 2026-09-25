package remotes

type AddRemoteDTO struct {
	Host      string `json:"host"`
	HostUser  string `json:"host_user"`
	HostPort  int32  `json:"host_port"`
	BasePath  string `json:"base_path"`
	PublicKey string `json:"public_key"`
}

type RemoteStatusDTO struct {
	RemoteID int32 `json:"remote_id"`
}
