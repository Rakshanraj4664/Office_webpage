import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createReferenceScene } from '../src/components/referenceScene.js';

test('solution scenes initialize and update', () => {
  globalThis.document = { createElement: () => ({ getContext: () => ({ fillRect() {}, fillText() {}, measureText() { return { width: 100 }; }, getImageData() { return { data: new Uint8Array(340 * 48 * 4) }; } }) }) };
  const world = createReferenceScene(new THREE.Scene());
  for (let index = 0; index < 4; index++) { world.setProp(index); world.update(2); }
});
