export function harvest(node, toolTier){ if(toolTier<node.tier) return {ok:false,reason:'precisa ferramenta superior'}; return {ok:true} }
