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

import { EdgeLabelRenderer, BaseEdge, getBezierPath } from '@xyflow/react';

const CustomEdge = ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    label,
    style = {},
}) => {
    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
        sourcePosition,
        targetPosition,
    });

    return (
        <>
            <BaseEdge id={id} path={edgePath} style={style} />
            <EdgeLabelRenderer>
                <div
                    style={{
                        position: 'absolute',
                        transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
                        pointerEvents: 'all',
                    }}
                    className="nodrag nopan text-xs px-3 py-1 rounded-sm"
                >
                    {label}
                </div>
            </EdgeLabelRenderer>
        </>
    );
};

const initialNodes = [
    {
        "id": "1",
        "type": "custom",
        "position": { "x": 0, "y": 0 },
        "data": { "label": "loginUser", "subType": "lambda" }
    },
    {
        "id": "2",
        "type": "custom",
        "position": { "x": 0, "y": 150 },
        "data": { "label": "getUserByEmail", "subType": "db" }
    },
    {
        "id": "3",
        "type": "custom",
        "position": { "x": 0, "y": 300 },
        "data": { "label": "password_verify", "subType": "auth" }
    },
    {
        "id": "4",
        "type": "custom",
        "position": { "x": 0, "y": 450 },
        "data": { "label": "session_start", "subType": "http" }
    }
];
const initialEdges = [
    {
        "id": "e1-2",
        "source": "1",
        "target": "2",
        "label": "calls",
        "animated": false,
        "type": "custom"
    },
    {
        "id": "e2-3",
        "source": "1",
        "target": "3",
        "label": "validates",
        "animated": false,
        "type": "custom"
    },
    {
        "id": "e3-4",
        "source": "1",
        "target": "4",
        "label": "starts session",
        "animated": true,
        "type": "custom"
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

    const edgeTypes = {
        custom: CustomEdge,
    };

    return (
        <div style={{ width: '100vw', height: '100vh' }}>
            <ReactFlow
                colorMode='dark'
                nodes={nodes}
                edges={edges}
                // edgeTypes={edgeTypes}
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