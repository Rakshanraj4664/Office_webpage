import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createReferenceScene } from '../src/components/referenceScene.js';
import { CORE_CAPABILITIES, SOLUTIONS_TABS } from '../src/data/protovoltData.js';

test('solution scenes initialize and update', () => {
  globalThis.document = { createElement: () => ({ getContext: () => ({ fillRect() {}, fillText() {}, measureText() { return { width: 100 }; }, getImageData() { return { data: new Uint8Array(340 * 48 * 4) }; } }) }) };
  const world = createReferenceScene(new THREE.Scene());
  for (let index = 0; index < 4; index++) { world.setProp(index); world.update(2); }
});

test('solution scopes match the remaining capabilities', () => {
  const ids = new Set(CORE_CAPABILITIES.map(cap => cap.id));
  assert.equal(SOLUTIONS_TABS.length, 4);
  assert.ok(ids.has('LightGuide Augmented Intelligence'));
  assert.ok(ids.has('IoT & IIoT'));
  assert.ok(!ids.has('Rapid Prototyping'));
  for (const solution of SOLUTIONS_TABS) for (const scope of solution.scopes) assert.ok(ids.has(scope), scope);
});

test('LightGuide projection highlights the active step and advances', () => {
  const scene = new THREE.Scene();
  const world = createReferenceScene(scene);
  world.setProp(3);
  const first = scene.getObjectByName('lightguide-marker-0');
  const second = scene.getObjectByName('lightguide-marker-1');
  const left = scene.getObjectByName('lightguide-bin-0');
  const right = scene.getObjectByName('lightguide-bin-1');
  const pointer = scene.getObjectByName('lightguide-pointer');
  assert.ok(first && second && left && right && pointer);
  world.update(0.2);
  assert.ok(left.children[0].material.opacity > right.children[0].material.opacity);
  assert.equal(pointer.position.x, -1.60);
  world.update(1.2);
  assert.ok(first.material.opacity > second.material.opacity);
  assert.equal(pointer.position.x, -0.66);
  world.update(2.2);
  assert.ok(second.material.opacity > first.material.opacity);
  world.update(3.2);
  assert.ok(right.children[0].material.opacity > left.children[0].material.opacity);
  assert.equal(pointer.position.x, 1.48);
});
