import React, { useCallback } from 'react';
import {
    ReactFlow,
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';
import AWS from './custom-nodes/aws';

import dagre from 'dagre'
import { Node, Edge, Position } from '@xyflow/react'

const nodeWidth = 240
const nodeHeight = 80

const getLayoutedElements = (nodes, edges, direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph()
  dagreGraph.setDefaultEdgeLabel(() => ({}))

  dagreGraph.setGraph({ rankdir: direction })

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight })
  })

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target)
  })

  dagre.layout(dagreGraph)

  const isHorizontal = direction === 'LR' || direction === 'RL'

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id)

    node.targetPosition = isHorizontal ? Position.Left : Position.Top
    node.sourcePosition = isHorizontal ? Position.Right : Position.Bottom

    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    }
  })

  return { nodes: layoutedNodes, edges }
}

const initialNodes = [
    {
        "id": "1",
        "type": "custom",
        "position": {
            "x": 0,
            "y": 0
        },
        "data": {
            "label": "loginUser",
            "subType": "lambda"
        }
    },
    {
        "id": "2",
        "type": "custom",
        "position": {
            "x": 0,
            "y": 150
        },
        "data": {
            "label": "getUserByEmail",
            "subType": "db"
        }
    },
    {
        "id": "3",
        "type": "custom",
        "position": {
            "x": 0,
            "y": 300
        },
        "data": {
            "label": "session_start",
            "subType": "session"
        }
    },
    {
        "id": "4",
        "type": "custom",
        "position": {
            "x": 150,
            "y": 300
        },
        "data": {
            "label": "password_verify",
            "subType": "auth"
        }
    }
];
const initialEdges = [
    {
        "id": "e1-2",
        "source": "1",
        "target": "2",
        "animated": false
    },
    {
        "id": "e2-4",
        "source": "2",
        "target": "4",
        "animated": false
    },
    {
        "id": "e4-3",
        "source": "4",
        "target": "3",
        "animated": false
    },
    {
        "id": "e2-1",
        "source": "2",
        "target": "1",
        "animated": true
    },
    {
        "id": "e1-3-alt",
        "source": "1",
        "target": "3",
        "animated": true
    }
];

const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
    initialNodes,
    initialEdges
)

export default function FlowMaker() {
    const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes)
    const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges)

    const onConnect = useCallback(
        (params) => setEdges((eds) => addEdge(params, eds)),
        [setEdges],
    );

    const nodeTypes = {
        custom: AWS,
    };

    return (
        <div style={{ width: '100vw', height: '100vh' }}>
            <ReactFlow
                colorMode='dark'
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                defaultEdgeOptions={{ type: 'smoothstep' }}
                fitView
            >
                <Controls />
                <MiniMap />
                <Background variant="dots" gap={12} size={1} />
            </ReactFlow>
        </div>
    );
}