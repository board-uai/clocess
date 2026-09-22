package remotes

type AddRemoteDTO struct {
	Host     string `json:"host"`
	HostUser string `json:"host_user"`
	// BUG: int8 maxes out at 127. Any real-world non-default SSH port
	// (2222, 8022, ...) overflows this and encoding/json will reject the
	// request with a range error before it even reaches the handler. Ports
	// go up to 65535 — needs at least uint16 (or int/int32 to match how
	// it's used elsewhere, e.g. strconv.Itoa(int(...)) in remote_status.go).
	HostPort  int16  `json:"host_port"`
	BasePath  string `json:"base_path"`
	PublicKey string `json:"public_key"`
}
