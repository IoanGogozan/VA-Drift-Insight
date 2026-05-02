CREATE TABLE network_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  node_code TEXT NOT NULL UNIQUE,
  node_type TEXT NOT NULL,
  pipe_type TEXT,
  status TEXT NOT NULL DEFAULT 'normal',
  geometry GEOMETRY(Point, 4326),
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_network_nodes_node_type ON network_nodes(node_type);
CREATE INDEX idx_network_nodes_pipe_type ON network_nodes(pipe_type);
CREATE INDEX idx_network_nodes_geometry ON network_nodes USING GIST(geometry);
