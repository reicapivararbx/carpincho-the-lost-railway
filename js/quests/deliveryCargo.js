export class MissionCargoManager{
  constructor(train){this.train=train;this.cargo=new Map()}
  load({questId,cargoId,amount=1,unitWeight=8,destination}){if(this.cargo.has(questId))return {ok:false,reason:'carga já embarcada'};const wagon=this.train.wagons.find(item=>item.type==='cargo'&&item.load(amount*unitWeight));if(!wagon)return {ok:false,reason:'capacidade de carga insuficiente'};const manifest={questId,cargoId,amount,unitWeight,destination,wagonId:wagon.id};this.cargo.set(questId,manifest);return {ok:true,manifest}}
  deliver(questId,destination){const manifest=this.cargo.get(questId);if(!manifest||manifest.destination!==destination)return {ok:false,reason:'destino inválido'};this.train.wagons.find(item=>item.id===manifest.wagonId)?.unload(manifest.amount*manifest.unitWeight);this.cargo.delete(questId);return {ok:true,cargoId:manifest.cargoId,amount:manifest.amount}}
  toJSON(){return [...this.cargo]}
  fromJSON(data){this.cargo=new Map(data||[])}
}
