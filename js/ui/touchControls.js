export function detectTouchInput(platform){
  const touchPoints=Number(platform?.navigator?.maxTouchPoints||0);
  const mediaMatches=query=>typeof platform?.matchMedia==='function'&&platform.matchMedia(query).matches;
  const mobileDevice=platform?.navigator?.userAgentData?.mobile===true;
  const hasCoarsePointer=mediaMatches('(pointer: coarse)');
  const hasFinePointer=mediaMatches('(pointer: fine)');
  const hasHover=mediaMatches('(hover: hover)');
  return mobileDevice||hasCoarsePointer||(touchPoints>0&&!hasFinePointer&&!hasHover);
}

export function interactionPrompt(binding,usesTouchInput,action){
  return usesTouchInput?`Toque em Interagir para ${action}`:`${String(binding||'e').toUpperCase()} ${action}`;
}

export class TouchControls{
  constructor(root,{onInput,onInteract},platform=window){
    this.root=root;
    this.platform=platform;
    this.hud=root?.closest?.('#hud')||root?.parentElement||null;
    this.onInput=onInput;
    this.onInteract=onInteract;
    this.isTouchInput=detectTouchInput(platform);
    this.enabled=true;
    this.activePointers=new Map();
    this.interactionPointerId=null;
    this.directionButtons=[];
    this.interactionButton=null;
    this.handleDirectionalPress=this.handleDirectionalPress.bind(this);
    this.handleDirectionalRelease=this.handleDirectionalRelease.bind(this);
    this.handleInteractionPress=this.handleInteractionPress.bind(this);
    this.handleInteractionRelease=this.handleInteractionRelease.bind(this);
    this.handleInputInterrupted=this.handleInputInterrupted.bind(this);
    this.handleVisibilityChange=this.handleVisibilityChange.bind(this);
    if(!root)return;
    root.hidden=!this.isTouchInput;
    this.hud?.classList?.toggle('touch-input',this.isTouchInput);
    if(!this.isTouchInput)return;
    this.directionButtons=[...root.querySelectorAll('[data-touch-action]')];
    this.interactionButton=root.querySelector('[data-touch-interaction]');
    this.directionButtons.forEach(button=>{
      button.addEventListener('pointerdown',this.handleDirectionalPress);
      button.addEventListener('pointerup',this.handleDirectionalRelease);
      button.addEventListener('pointercancel',this.handleDirectionalRelease);
      button.addEventListener('lostpointercapture',this.handleDirectionalRelease);
    });
    this.interactionButton?.addEventListener('pointerdown',this.handleInteractionPress);
    this.interactionButton?.addEventListener('pointerup',this.handleInteractionRelease);
    this.interactionButton?.addEventListener('pointercancel',this.handleInteractionRelease);
    this.interactionButton?.addEventListener('lostpointercapture',this.handleInteractionRelease);
    platform.addEventListener?.('blur',this.handleInputInterrupted);
    platform.addEventListener?.('pagehide',this.handleInputInterrupted);
    platform.document?.addEventListener?.('visibilitychange',this.handleVisibilityChange);
  }

  handleDirectionalPress(event){
    const action=event.currentTarget.dataset.touchAction;
    if(!action||this.activePointers.has(event.pointerId))return;
    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    const wasActive=[...this.activePointers.values()].includes(action);
    this.activePointers.set(event.pointerId,action);
    this.setActionActive(action,true);
    if(!wasActive)this.onInput(action,true);
  }

  handleDirectionalRelease(event){
    const action=this.activePointers.get(event.pointerId);
    if(!action)return;
    event.preventDefault();
    this.activePointers.delete(event.pointerId);
    const remainsActive=[...this.activePointers.values()].includes(action);
    this.setActionActive(action,remainsActive);
    if(!remainsActive)this.onInput(action,false);
  }

  handleInteractionPress(event){
    if(this.interactionPointerId!==null)return;
    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    this.interactionPointerId=event.pointerId;
    event.currentTarget.classList.add('active');
    event.currentTarget.setAttribute?.('aria-pressed','true');
    this.onInteract();
  }

  handleInteractionRelease(event){
    if(event.pointerId!==this.interactionPointerId)return;
    event.preventDefault();
    this.interactionPointerId=null;
    event.currentTarget.classList.remove('active');
    event.currentTarget.setAttribute?.('aria-pressed','false');
  }

  setActionActive(action,isActive){
    this.directionButtons.filter(button=>button.dataset.touchAction===action).forEach(button=>{
      button.classList.toggle('active',isActive);
      button.setAttribute?.('aria-pressed',String(isActive));
    });
  }

  releaseAll(){
    const activeActions=new Set(this.activePointers.values());
    this.activePointers.clear();
    activeActions.forEach(action=>{
      this.setActionActive(action,false);
      this.onInput(action,false);
    });
    this.interactionPointerId=null;
    this.interactionButton?.classList.remove('active');
    this.interactionButton?.setAttribute?.('aria-pressed','false');
  }

  handleInputInterrupted(){
    this.releaseAll();
  }

  handleVisibilityChange(){
    if(this.platform.document?.hidden)this.releaseAll();
  }

  setEnabled(enabled){
    this.enabled=Boolean(enabled);
    if(!this.enabled)this.releaseAll();
    if(this.root)this.root.hidden=!this.isTouchInput||!this.enabled;
  }

  destroy(){
    this.setEnabled(false);
    this.directionButtons.forEach(button=>{
      button.removeEventListener('pointerdown',this.handleDirectionalPress);
      button.removeEventListener('pointerup',this.handleDirectionalRelease);
      button.removeEventListener('pointercancel',this.handleDirectionalRelease);
      button.removeEventListener('lostpointercapture',this.handleDirectionalRelease);
    });
    this.interactionButton?.removeEventListener('pointerdown',this.handleInteractionPress);
    this.interactionButton?.removeEventListener('pointerup',this.handleInteractionRelease);
    this.interactionButton?.removeEventListener('pointercancel',this.handleInteractionRelease);
    this.interactionButton?.removeEventListener('lostpointercapture',this.handleInteractionRelease);
    this.platform.removeEventListener?.('blur',this.handleInputInterrupted);
    this.platform.removeEventListener?.('pagehide',this.handleInputInterrupted);
    this.platform.document?.removeEventListener?.('visibilitychange',this.handleVisibilityChange);
    this.hud?.classList?.remove('touch-input');
  }
}
