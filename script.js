const width = 600, height = 400;
let nodes = [
    { id: 0, type: 'parent' }  // Parent node
];
let links = [];

const svg = d3.select("svg");
let simulation = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(links).id(d => d.id).distance(100))
    .force("charge", d3.forceManyBody().strength(-150))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("boundary", boundaryForce())
    .on("tick", ticked);

let link = svg.selectAll(".link")
    .data(links)
    .enter().append("line")
    .attr("class", "link");

let node = svg.selectAll(".node")
    .data(nodes)
    .enter().append("g")
    .attr("class", "node")
    .call(d3.drag()
        .on("start", dragStarted)
        .on("drag", dragged)
        .on("end", dragEnded));

node.append("circle")
    .attr("r", d => d.type === 'parent' ? 15 : 10)
    .attr("class", d => d.type === 'parent' ? 'parent-node' : 'child-node');

node.append("text")
    .attr("dx", d => d.type === 'parent' ? 20 : 15)
    .attr("dy", 5)
    .text(d => d.type === 'parent' ? "" : d.letter);

function updateNodes() {
    const input = document.getElementById('nodeInput').value;
    
    // Remove existing nodes and links
    svg.selectAll(".node").remove();
    svg.selectAll(".link").remove();
    
    // Reset nodes array with parent
    nodes = [{ id: 0, type: 'parent' }];
    links = [];
    
    // Add child nodes for each character
    input.split('').forEach((char, index) => {
        nodes.push({
            id: index + 1,
            type: 'child',
            letter: char
        });
        links.push({
            source: 0,
            target: index + 1
        });
    });
    
    // Update the visualization
    link = svg.selectAll(".link")
        .data(links)
        .enter().append("line")
        .attr("class", "link");
    
    node = svg.selectAll(".node")
        .data(nodes)
        .enter().append("g")
        .attr("class", "node")
        .call(d3.drag()
            .on("start", dragStarted)
            .on("drag", dragged)
            .on("end", dragEnded));
    
    node.append("circle")
        .attr("r", d => d.type === 'parent' ? 15 : 10)
        .attr("class", d => d.type === 'parent' ? 'parent-node' : 'child-node');
    
    node.append("text")
        .attr("dx", d => d.type === 'parent' ? 20 : 15)
        .attr("dy", 5)
        .text(d => d.type === 'parent' ? "" : d.letter);
    
    // Restart simulation with new data
    simulation.nodes(nodes);
    simulation.force("link").links(links);
    simulation.alpha(0.3).restart();
}

function ticked() {
    link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);
    
    node
        .attr("transform", d => `translate(${d.x},${d.y})`);
}

function dragStarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
}

function dragged(event, d) {
    if (d.type === 'parent') {
        // Restrict parent node to 50x50 box
        const boxSize = 50;
        const centerX = width / 2;
        const centerY = height / 2;
        
        d.fx = Math.max(centerX - boxSize/2, Math.min(centerX + boxSize/2, event.x));
        d.fy = Math.max(centerY - boxSize/2, Math.min(centerY + boxSize/2, event.y));
    } else {
        // Keep child nodes within SVG boundaries
        const radius = 10;
        d.fx = Math.max(radius, Math.min(width - radius, event.x));
        d.fy = Math.max(radius, Math.min(height - radius, event.y));
    }
}

function dragEnded(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
}

// Add boundary force function
function boundaryForce() {
    const radius = 10; // Node radius
    return function(alpha) {
        for (const d of nodes) {
            if (d.type === 'child') {
                // Keep nodes within SVG boundaries
                d.x = Math.max(radius, Math.min(width - radius, d.x));
                d.y = Math.max(radius, Math.min(height - radius, d.y));
            }
        }
    };
} 