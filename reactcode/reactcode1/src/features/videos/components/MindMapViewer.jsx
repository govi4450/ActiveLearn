import React, { useState, useCallback } from 'react';
import Tree from 'react-d3-tree';

const renderCustomNodeElement = (rd3tProps) => {
  const { nodeDatum } = rd3tProps;
  
  return (
    <g>
      <circle r={15} fill="#3b82f6" stroke="#2563eb" strokeWidth="2" />
      <text 
        fill="white" 
        stroke="none" 
        x={20} 
        dy=".35em"
        style={{
          fontSize: '14px',
          fontWeight: '500',
          textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
        }}
      >
        {nodeDatum.name}
      </text>
    </g>
  );
};

export default function MindMapViewer({ mindmap }) {
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const containerRef = React.useRef();

  React.useEffect(() => {
    if (containerRef.current) {
      const { width } = containerRef.current.getBoundingClientRect();
      setTranslate({ x: width / 2, y: 80 });
    }
  }, []);

  const convertToTreeData = useCallback(() => {
    if (!mindmap) return null;

    const { nodes = [], edges = [] } = mindmap;
    const nodeMap = new Map(nodes.map(node => [node.id, { ...node, name: node.label, children: [] }]));
    const rootNodes = new Set(nodes.map(node => node.id));

    // Build the tree structure
    edges.forEach(edge => {
      const parent = nodeMap.get(edge.source);
      const child = nodeMap.get(edge.target);
      if (parent && child) {
        parent.children.push(child);
        rootNodes.delete(edge.target);
      }
    });

    // Find root nodes (nodes that are not a target of any edge)
    const roots = Array.from(rootNodes).map(id => nodeMap.get(id));
    return roots.length > 0 ? roots[0] : null;
  }, [mindmap]);

  const treeData = convertToTreeData();

  if (!treeData) return <div className="p-4 text-gray-400">No mindmap data available</div>;

  return (
    <div 
      ref={containerRef} 
      style={{
        width: '100%',
        height: '600px',
        backgroundColor: '#0f1724',
        borderRadius: '8px',
        overflow: 'hidden'
      }}
    >
      <Tree
        data={treeData}
        orientation="vertical"
        translate={translate}
        pathFunc="step"
        collapsible={false}
        nodeSize={{ x: 200, y: 100 }}
        separation={{ siblings: 1.5, nonSiblings: 1.5 }}
        renderCustomNodeElement={renderCustomNodeElement}
        pathClassFunc={() => 'tree-link'}
        styles={{
          links: {
            stroke: '#3b82f6',
            strokeWidth: 2,
          },
        }}
      />
      <style jsx global>{`
        .tree-link {
          fill: none;
          stroke: #3b82f6;
          stroke-width: 2;
        }
        .rd3t-node {
          cursor: default;
        }
        .rd3t-node > circle {
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
