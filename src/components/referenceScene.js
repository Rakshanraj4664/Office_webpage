// Scene adapted from the user's supplied standalone HTML reference.
import * as THREE from 'three';

export function createReferenceScene(scene) {
  const C = (hex) => new THREE.Color(hex).convertSRGBToLinear();
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const V2 = (x, y) => new THREE.Vector2(x, y);
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const PERIOD = 5;
  let activeProp = 0, printerIdx = 0, onTab = () => {}, onPrinter = () => {};
  /* materials */
  var M = {
    paint: new THREE.MeshPhysicalMaterial({ color: C(0xf1f3f6), roughness: 0.34, metalness: 0.0, clearcoat: 1, clearcoatRoughness: 0.14 }),
    navy: new THREE.MeshPhysicalMaterial({ color: C(0x12294d), roughness: 0.36, metalness: 0.45, clearcoat: 0.7, clearcoatRoughness: 0.18 }),
    graphite: new THREE.MeshStandardMaterial({ color: C(0x2a2f37), roughness: 0.48, metalness: 0.55 }),
    alu: new THREE.MeshStandardMaterial({ color: C(0xd5d9df), roughness: 0.26, metalness: 1.0 }),
    darkAlu: new THREE.MeshStandardMaterial({ color: C(0x7b8492), roughness: 0.34, metalness: 1.0 }),
    gold: new THREE.MeshStandardMaterial({ color: C(0xd0a748), roughness: 0.24, metalness: 1.0 }),
    rubber: new THREE.MeshStandardMaterial({ color: C(0x16191e), roughness: 0.92, metalness: 0 }),
    top: new THREE.MeshStandardMaterial({ color: C(0xe6e9ee), roughness: 0.55, metalness: 0.05 }),
    pei: new THREE.MeshStandardMaterial({ color: C(0x2e343d), roughness: 0.85, metalness: 0.2 }),
    glass: new THREE.MeshPhysicalMaterial({ color: C(0x0e1b30), roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.2, depthWrite: false, clearcoat: 1 }),
    board: new THREE.MeshStandardMaterial({ color: C(0x16304f), roughness: 0.5, metalness: 0.3 }),
    ink: new THREE.MeshStandardMaterial({ color: C(0x0c1626), roughness: 0.55, metalness: 0.3 })
  };
  var glowGold = new THREE.MeshBasicMaterial({ color: C(0xe3b855) });
  var glowWhite = new THREE.MeshBasicMaterial({ color: new THREE.Color(1, 1, 1).multiplyScalar(2.2) });

  /* geometry helpers */
  function mesh(geo, mat, parent, x, y, z, rx, ry, rz, noShadow) {
    var o = new THREE.Mesh(geo, mat); o.castShadow = !noShadow; o.receiveShadow = true;
    o.position.set(x || 0, y || 0, z || 0);
    if (rx) o.rotation.x = rx; if (ry) o.rotation.y = ry; if (rz) o.rotation.z = rz;
    if (parent) parent.add(o); return o;
  }
  var BoxG = function (w, h, d) { return new THREE.BoxGeometry(w, h, d); };
  var CylG = function (a, b, h, s) { return new THREE.CylinderGeometry(a, b, h, s || 56); };
  function cylX(r, len, mat, p, x, y, z) { return mesh(CylG(r, r, len), mat, p, x, y, z, 0, 0, Math.PI / 2); }
  function cylY(rt, rb, h, mat, p, x, y, z) { return mesh(CylG(rt, rb, h), mat, p, x, y, z); }
  function cylZ(r, len, mat, p, x, y, z) { return mesh(CylG(r, r, len), mat, p, x, y, z, Math.PI / 2, 0, 0); }
  function ringX(R, r, mat, p, x, y, z) { return mesh(new THREE.TorusGeometry(R, r, 10, 72), mat, p, x, y, z, 0, Math.PI / 2, 0, true); }
  function ringY(R, r, mat, p, x, y, z) { return mesh(new THREE.TorusGeometry(R, r, 10, 72), mat, p, x, y, z, Math.PI / 2, 0, 0, true); }
  function ringZ(R, r, mat, p, x, y, z) { return mesh(new THREE.TorusGeometry(R, r, 10, 72), mat, p, x, y, z, 0, 0, 0, true); }
  function lathe(pts, mat, p, x, y, z) { return mesh(new THREE.LatheGeometry(pts.map(function (q) { return V2(q[0], q[1]); }), 80), mat, p, x, y, z); }

  function rrShape(w, h, r) {
    var s = new THREE.Shape(), x = -w / 2, y = -h / 2; r = Math.min(r, w / 2 - 0.001, h / 2 - 0.001);
    s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false);
    s.lineTo(x + w, y + h - r); s.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false);
    s.lineTo(x + r, y + h); s.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false);
    s.lineTo(x, y + r); s.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false); return s;
  }
  function smoothNormals(geo, cosT) {
    var p = geo.attributes.position, n = geo.attributes.normal, cnt = p.count, map = {}, i, j, k, key, list;
    var fn = n.array.slice(), out = new Float32Array(cnt * 3), keys = new Array(cnt);
    for (i = 0; i < cnt; i++) { key = Math.round(p.getX(i) * 400) + ',' + Math.round(p.getY(i) * 400) + ',' + Math.round(p.getZ(i) * 400); keys[i] = key; (map[key] = map[key] || []).push(i); }
    for (i = 0; i < cnt; i++) {
      list = map[keys[i]]; var sx = 0, sy = 0, sz = 0;
      for (k = 0; k < list.length; k++) { j = list[k]; var d = fn[i * 3] * fn[j * 3] + fn[i * 3 + 1] * fn[j * 3 + 1] + fn[i * 3 + 2] * fn[j * 3 + 2]; if (d > cosT) { sx += fn[j * 3]; sy += fn[j * 3 + 1]; sz += fn[j * 3 + 2]; } }
      var l = Math.hypot(sx, sy, sz) || 1; out[i * 3] = sx / l; out[i * 3 + 1] = sy / l; out[i * 3 + 2] = sz / l;
    }
    geo.setAttribute('normal', new THREE.BufferAttribute(out, 3)); return geo;
  }
  function rboxZ(w, h, d, r, b) { /* rounded box, extruded along z, centred */
    b = b || Math.min(r * 0.5, 0.03);
    var g = new THREE.ExtrudeGeometry(rrShape(w - 2 * b, h - 2 * b, Math.max(r - b, 0.005)), { depth: Math.max(d - 2 * b, 0.001), bevelEnabled: true, bevelThickness: b, bevelSize: b, bevelSegments: 3, curveSegments: 10 });
    g.translate(0, 0, -(d - 2 * b) / 2); return smoothNormals(g, 0.5);
  }
  function rboxFlat(w, d, h, r) { var g = rboxZ(w, d, h, r); g.rotateX(-Math.PI / 2); return g; }
  function hull(pts) {
    pts.sort(function (a, b) { return a.x - b.x || a.y - b.y; });
    function cross(o, a, b) { return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x); }
    var lo = [], up = [], i;
    for (i = 0; i < pts.length; i++) { while (lo.length >= 2 && cross(lo[lo.length - 2], lo[lo.length - 1], pts[i]) <= 0) lo.pop(); lo.push(pts[i]); }
    for (i = pts.length - 1; i >= 0; i--) { while (up.length >= 2 && cross(up[up.length - 2], up[up.length - 1], pts[i]) <= 0) up.pop(); up.push(pts[i]); }
    up.pop(); lo.pop(); return lo.concat(up);
  }
  function linkGeo(circles, width, bevel) { /* cast arm link: hull of circles in the arm plane, extruded across the arm */
    var pts = [];
    circles.forEach(function (c) { for (var k = 0; k < 44; k++) { var a = k / 44 * Math.PI * 2; pts.push({ x: c[0] + (c[2] - bevel) * Math.cos(a), y: c[1] + (c[2] - bevel) * Math.sin(a) }); } });
    var h = hull(pts), shape = new THREE.Shape(h.map(function (p) { return V2(p.x, p.y); }));
    var g = new THREE.ExtrudeGeometry(shape, { depth: width - 2 * bevel, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 4, curveSegments: 1 });
    g.translate(0, 0, -(width - 2 * bevel) / 2); g.rotateY(-Math.PI / 2); return smoothNormals(g, 0.55);
  }
  function tube(pts, r, mat, parent) { var t = mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, r, 10, false), mat, parent, 0, 0, 0, 0, 0, 0, true); t.castShadow = true; return t; }
  function rnd(seed) { var s = seed; return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }

  /* floor shadow catcher (the page background shows through) */
  var FLOOR_Y = -1.66;
  var shadowFloor = new THREE.Mesh(new THREE.PlaneGeometry(500, 500), new THREE.ShadowMaterial({ opacity: 0.17 }));
  shadowFloor.rotation.x = -Math.PI / 2; shadowFloor.position.y = FLOOR_Y; shadowFloor.receiveShadow = true; scene.add(shadowFloor);

  /* ---------- industrial 6-axis robot ---------- */
  function createRobot() {
    var g = new THREE.Group(), yaw = new THREE.Group(); g.add(yaw);
    var L1 = 2.2, L2 = 2.0, SY = 1.45, WR = 1.0;
    var robot = { g: g, j: [0, 0, 0], state: { c: 0, k: 0 } };

    /* floor plate + base casting */
    mesh(rboxFlat(1.9, 1.9, 0.1, 0.14), M.darkAlu, g, 0, 0.05, 0);
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (s) { cylY(0.065, 0.065, 0.05, M.alu, g, s[0] * 0.78, 0.125, s[1] * 0.78); });
    lathe([[0.001, 0.1], [0.88, 0.1], [0.92, 0.17], [0.88, 0.32], [0.76, 0.45], [0.7, 0.53], [0.001, 0.53]], M.navy, g, 0, 0, 0);
    ringY(0.72, 0.014, M.gold, g, 0, 0.5, 0);
    cylZ(0.075, 0.26, M.graphite, g, 0, 0.32, -0.9);
    cylZ(0.055, 0.1, M.alu, g, 0, 0.32, -1.05);

    /* turret */
    lathe([[0.001, 0.53], [0.62, 0.53], [0.64, 0.6], [0.58, 0.82], [0.52, 1.1], [0.51, 1.75], [0.001, 1.75]], M.paint, yaw, 0, 0, 0);
    ringY(0.58, 0.012, M.gold, yaw, 0, 0.78, 0);

    /* shoulder (J2) */
    cylX(0.5, 1.0, M.navy, yaw, 0, SY, 0);
    [-1, 1].forEach(function (s) { cylX(0.43, 0.04, M.alu, yaw, s * 0.52, SY, 0); ringX(0.5, 0.013, M.gold, yaw, s * 0.5, SY, 0); cylX(0.1, 0.06, M.darkAlu, yaw, s * 0.56, SY, 0); });
    var sh = new THREE.Group(); sh.position.set(0, SY, 0); yaw.add(sh);
    mesh(linkGeo([[0, 0, 0.42], [L1, 0, 0.31], [L1 * 0.46, 0.16, 0.37]], 0.58, 0.05), M.paint, sh, 0, 0, 0);
    [-1, 1].forEach(function (s) { mesh(rboxZ(0.5, 0.2, 0.012, 0.05), M.navy, sh, s * 0.292, 0.02, L1 * 0.5, 0, Math.PI / 2, 0); });
    tube([V(0, 0.46, 0.5), V(0, 0.56, L1 * 0.42), V(0, 0.46, L1 * 0.8), V(0, 0.36, L1 - 0.28)], 0.036, M.rubber, sh);

    /* elbow (J3) */
    var el = new THREE.Group(); el.position.set(0, 0, L1); sh.add(el);
    cylX(0.36, 0.76, M.navy, el, 0, 0, 0);
    [-1, 1].forEach(function (s) { cylX(0.3, 0.04, M.alu, el, s * 0.4, 0, 0); ringX(0.36, 0.012, M.gold, el, s * 0.38, 0, 0); cylX(0.08, 0.05, M.darkAlu, el, s * 0.43, 0, 0); });
    mesh(linkGeo([[0, 0, 0.27], [L2 - 0.3, 0, 0.2], [L2 * 0.3, 0.08, 0.25]], 0.44, 0.04), M.paint, el, 0, 0, 0);
    cylZ(0.22, 0.34, M.navy, el, 0, 0, L2 - 0.4);
    ringZ(0.22, 0.012, M.gold, el, 0, 0, L2 - 0.56);
    tube([V(0, 0.32, 0.4), V(0, 0.4, L2 * 0.45), V(0, 0.3, L2 - 0.6)], 0.03, M.rubber, el);

    /* wrist (J4, J5, J6) and gripper */
    var wr = new THREE.Group(); wr.position.set(0, 0, L2); el.add(wr);
    cylZ(0.17, 0.22, M.navy, wr, 0, 0, -0.16);
    cylX(0.19, 0.46, M.navy, wr, 0, 0, 0.02);
    [-1, 1].forEach(function (s) { cylX(0.14, 0.04, M.alu, wr, s * 0.25, 0, 0.02); ringX(0.19, 0.01, M.gold, wr, s * 0.235, 0, 0.02); });
    cylZ(0.13, 0.2, M.paint, wr, 0, 0, 0.2);
    cylZ(0.15, 0.05, M.alu, wr, 0, 0, 0.34);
    ringZ(0.15, 0.01, M.gold, wr, 0, 0, 0.37);
    cylZ(0.17, 0.07, M.graphite, wr, 0, 0, 0.41);
    mesh(rboxZ(0.44, 0.25, 0.28, 0.05), M.graphite, wr, 0, 0, 0.59);
    mesh(BoxG(0.3, 0.012, 0.18), M.gold, wr, 0, 0.128, 0.59);
    mesh(rboxZ(0.58, 0.06, 0.1, 0.02), M.alu, wr, 0, 0, 0.77);
    function finger(sx) {
      var f = new THREE.Group(); f.position.set(sx * 0.3, 0, 0.9); wr.add(f);
      mesh(BoxG(0.075, 0.2, 0.2), M.alu, f, 0, 0, 0);
      mesh(BoxG(0.02, 0.15, 0.13), M.rubber, f, -sx * 0.045, 0, 0.03);
      return f;
    }
    var fL = finger(-1), fR = finger(1);
    robot.grip = function (c) { var x = 0.3 - 0.17 * c; fL.position.x = -x; fR.position.x = x; };
    robot.aim = function (P) {
      yaw.rotation.y = Math.atan2(P.x, P.z);
      var r = Math.hypot(P.x, P.z), wy = P.y + WR - SY;
      var d = clamp(Math.hypot(r, wy), 0.8, L1 + L2 - 0.02);
      var a1 = Math.atan2(wy, r) + Math.acos(clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1));
      var inner = Math.acos(clamp((L1 * L1 + L2 * L2 - d * d) / (2 * L1 * L2), -1, 1));
      var a2 = a1 - (Math.PI - inner);
      sh.rotation.x = -a1; el.rotation.x = -(a2 - a1); wr.rotation.x = -((-Math.PI / 2) - a2);
      robot.j = [yaw.rotation.y * 180 / Math.PI, a1 * 180 / Math.PI, (a2 - a1) * 180 / Math.PI];
    };
    return robot;
  }
  var PART_Y = 0.35;
  function makePart(parent) {
    var p = mesh(rboxZ(0.5, 0.5, 0.5, 0.07), M.navy, parent, 0, PART_Y, 0);
    mesh(BoxG(0.3, 0.012, 0.3), M.gold, p, 0, 0.253, 0, 0, 0, 0, true);
    return p;
  }
  var Pv = new THREE.Vector3();
  function stepRobot(robot, part, T, A, B) {
    var k = Math.floor(T / PERIOD), t = T - k * PERIOD, dir = k % 2;
    var from = dir ? B : A, to = dir ? A : B, HY = 1.45, LY = PART_Y;
    var kf = [[0, from, HY], [0.9, from, LY], [1.3, from, LY], [1.9, from, HY], [3.3, to, HY], [4.0, to, LY], [4.4, to, LY], [5.0, to, HY]];
    var q = 0; while (q < kf.length - 2 && t >= kf[q + 1][0]) q++;
    var a = kf[q], b = kf[q + 1], u = clamp((t - a[0]) / (b[0] - a[0]), 0, 1), e = u * u * (3 - 2 * u);
    Pv.set(a[1].x + (b[1].x - a[1].x) * e, a[2] + (b[2] - a[2]) * e, a[1].z + (b[1].z - a[1].z) * e);
    robot.aim(Pv);
    var c = t < 0.9 ? 0 : t < 1.3 ? (t - 0.9) / 0.4 : t < 4.0 ? 1 : t < 4.4 ? 1 - (t - 4.0) / 0.4 : 0;
    c = c * c * (3 - 2 * c);
    robot.grip(c);
    if (t < 1.3) part.position.set(from.x, LY, from.z);
    else if (t < 4.0) part.position.set(Pv.x, Pv.y, Pv.z);
    else part.position.set(to.x, LY, to.z);
    part.rotation.y = Math.atan2(part.position.x, part.position.z);
    robot.state = { c: c, k: k };
  }

  /* ---------- hero cell ---------- */
  var cell = new THREE.Group(); scene.add(cell);
  var tbl = new THREE.Group(); tbl.position.set(0.9, 0, 0.8); cell.add(tbl);
  mesh(rboxFlat(6.6, 5.4, 0.14, 0.1), M.top, tbl, 0, -0.07, 0);
  mesh(BoxG(6.6, 0.012, 0.03), M.gold, tbl, 0, -0.005, 2.7, 0, 0, 0, true);
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (s) {
    mesh(BoxG(0.17, 1.52, 0.17), M.alu, tbl, s[0] * 3.15, FLOOR_Y / 2 - 0.07 + 0.0, s[1] * 2.5);
    mesh(BoxG(0.05, 1.5, 0.05), M.graphite, tbl, s[0] * 3.15, FLOOR_Y / 2 - 0.07, s[1] * 2.5 + (s[1] > 0 ? 0.095 : -0.095), 0, 0, 0, true);
  });
  mesh(BoxG(6.1, 0.1, 0.1), M.alu, tbl, 0, -1.2, -2.5); mesh(BoxG(6.1, 0.1, 0.1), M.alu, tbl, 0, -1.2, 2.5);
  mesh(BoxG(0.1, 0.1, 4.8), M.alu, tbl, -3.15, -1.2, 0); mesh(BoxG(0.1, 0.1, 4.8), M.alu, tbl, 3.15, -1.2, 0);

  var robot = createRobot(); robot.g.position.set(0.3, 0, -0.9); cell.add(robot.g);
  var part = makePart(robot.g);
  var PA = V(-1.9, PART_Y, 2.4), PB = V(1.7, PART_Y, 2.4);
  function fixture(p, x, z) {
    mesh(rboxFlat(1.2, 1.2, 0.1, 0.1), M.darkAlu, p, x, 0.05, z);
    var rg = new THREE.Mesh(new THREE.RingGeometry(0.46, 0.5, 64), glowGold); rg.rotation.x = -Math.PI / 2; rg.position.set(x, 0.106, z); p.add(rg);
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (s) { cylY(0.04, 0.04, 0.06, M.gold, p, x + s[0] * 0.5, 0.12, z + s[1] * 0.5); });
  }
  fixture(robot.g, PA.x, PA.z); fixture(robot.g, PB.x, PB.z);

  var flange = new THREE.Group(); flange.position.set(3.2, 0, 2.5); cell.add(flange);
  lathe([[0.001, 0], [0.8, 0], [0.82, 0.05], [0.82, 0.3], [0.7, 0.36], [0.5, 0.36], [0.46, 0.34], [0.46, 0.4], [0.3, 0.4], [0.3, 0.2], [0.001, 0.2]], M.alu, flange, 0, 0, 0);
  for (var bi = 0; bi < 8; bi++) { var an = bi / 8 * Math.PI * 2; cylY(0.045, 0.045, 0.02, M.ink, flange, Math.cos(an) * 0.63, 0.362, Math.sin(an) * 0.63); }

  /* ---------- prop stage ---------- */
  var STAGE_X = 30;
  var stage = new THREE.Group(); stage.position.set(STAGE_X, 0, 0); scene.add(stage);
  mesh(CylG(3.2, 3.2, 0.3, 96), M.top, stage, 0, -0.15, 0);
  mesh(CylG(0.9, 1.1, 1.3), M.alu, stage, 0, -0.95, 0);
  var rg0 = new THREE.Mesh(new THREE.RingGeometry(3.06, 3.12, 120), glowGold); rg0.rotation.x = -Math.PI / 2; rg0.position.y = 0.003; stage.add(rg0);
  var props = [];

  /* prop 0: vision rig */
  (function () {
    var g = new THREE.Group(); stage.add(g);
    mesh(rboxFlat(3.7, 2.6, 0.08, 0.06), M.alu, g, 0, 0.04, 0);
    mesh(rboxFlat(3.4, 2.3, 0.12, 0.05), M.board, g, 0, 0.14, 0);
    var r = rnd(7);
    for (var i = 0; i < 30; i++) {
      var w = 0.14 + r() * 0.36, h = 0.05 + r() * 0.09, d = 0.12 + r() * 0.3;
      mesh(BoxG(w, h, d), r() > 0.35 ? M.ink : M.alu, g, -1.5 + r() * 3, 0.2 + h / 2, -0.95 + r() * 1.9);
    }
    var defect = new THREE.Mesh(new THREE.RingGeometry(0.2, 0.25, 40), new THREE.MeshBasicMaterial({ color: C(0xe3b855), transparent: true, side: THREE.DoubleSide }));
    defect.rotation.x = -Math.PI / 2; defect.position.set(0.7, 0.36, 0.25); g.add(defect);
    [-2.3, 2.3].forEach(function (x) { mesh(BoxG(0.16, 3.1, 0.16), M.alu, g, x, 1.55, -1.1); });
    mesh(BoxG(4.8, 0.16, 0.3), M.alu, g, 0, 3.05, -1.1);
    var car = new THREE.Group(); g.add(car);
    mesh(BoxG(0.6, 0.3, 0.5), M.graphite, car, 0, 2.9, -1.1);
    mesh(BoxG(0.2, 0.2, 1.0), M.alu, car, 0, 2.9, -0.55);
    cylY(0.3, 0.3, 0.9, M.navy, car, 0, 2.35, 0);
    cylY(0.34, 0.34, 0.08, M.alu, car, 0, 2.85, 0);
    cylY(0.32, 0.32, 0.06, M.graphite, car, 0, 1.9, 0);
    var ring = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.05, 10, 48), glowWhite); ring.rotation.x = Math.PI / 2; ring.position.y = 1.85; car.add(ring);
    var cone = new THREE.Mesh(new THREE.ConeGeometry(0.95, 1.5, 36, 1, true), new THREE.MeshBasicMaterial({ color: C(0xe3b855), transparent: true, opacity: 0.1, side: THREE.DoubleSide, depthWrite: false }));
    cone.position.y = 1.1; car.add(cone);
    var scan = new THREE.Mesh(BoxG(0.035, 0.012, 2.3), glowGold); scan.position.y = 0.215; g.add(scan);
    props.push({ g: g, update: function (T) {
      var x = Math.sin(T * 0.9) * 1.5; car.position.x = x; scan.position.x = x;
      var near = clamp(1 - Math.abs(x - 0.7) / 0.35, 0, 1);
      defect.material.opacity = 0.25 + near * 0.75; defect.scale.setScalar(1 + near * 0.35);
    } });
  })();

  /* prop 1: robot cell */
  var mini = createRobot(), miniPart;
  (function () {
    var g = new THREE.Group(); stage.add(g);
    mini.g.scale.setScalar(0.62); mini.g.position.set(0, 0, -0.8); g.add(mini.g);
    miniPart = makePart(mini.g);
    var cage = new THREE.LineSegments(new THREE.EdgesGeometry(BoxG(5.2, 3.5, 4.8)), new THREE.LineBasicMaterial({ color: C(0x0a1b33), transparent: true, opacity: 0.55 }));
    cage.position.y = 1.75; g.add(cage);
    [[-2.6, -2.4], [2.6, -2.4], [-2.6, 2.4], [2.6, 2.4]].forEach(function (c) { mesh(BoxG(0.12, 3.5, 0.12), M.alu, g, c[0], 1.75, c[1]); });
    mesh(BoxG(5.2, 0.08, 0.12), M.gold, g, 0, 3.5, 2.4);
    mesh(rboxFlat(3.8, 1.2, 0.1, 0.05), M.graphite, g, 0, 0.05, 1.7);
    props.push({ g: g, update: function (T) { stepRobot(mini, miniPart, T, V(-2.3, PART_Y, 2.6), V(2.3, PART_Y, 2.6)); } });
  })();

  /* prop 2: embedded board */
  (function () {
    var g = new THREE.Group(); stage.add(g);
    var b = new THREE.Group(); g.add(b);
    mesh(BoxG(3.5, 0.14, 2.4), M.board, b, 0, 0.2, 0);
    mesh(BoxG(0.9, 0.12, 0.9), M.ink, b, -0.5, 0.33, -0.2);
    for (var i = 0; i < 10; i++) mesh(BoxG(0.05, 0.36, 0.78), M.alu, b, -0.86 + i * 0.08, 0.57, -0.2);
    for (var c = 0; c < 5; c++) { var x = -1.3 + c * 0.55; cylZ(0.14, 0.4, M.gold, b, x, 0.4, 1.05); cylZ(0.08, 0.42, M.ink, b, x, 0.4, 1.05); }
    mesh(BoxG(0.62, 0.3, 0.36), M.navy, b, 1.15, 0.42, -0.85);
    mesh(BoxG(0.62, 0.3, 0.36), M.navy, b, 1.15, 0.42, -0.4);
    for (var k = 0; k < 6; k++) cylY(0.1, 0.1, 0.24, M.alu, b, 0.35 + k * 0.2, 0.38, -0.85);
    var pulses = [];
    for (var t = 0; t < 5; t++) {
      var tx = -1.3 + t * 0.55;
      mesh(BoxG(0.03, 0.01, 0.95), M.gold, b, tx, 0.275, 0.65, 0, 0, 0, true);
      pulses.push(mesh(BoxG(0.08, 0.04, 0.08), glowWhite, b, tx, 0.3, 0.2, 0, 0, 0, true));
    }
    var leds = [0, 1, 2].map(function (n) { return mesh(BoxG(0.09, 0.05, 0.09), glowGold, b, 1.4, 0.3, 0.3 + n * 0.2, 0, 0, 0, true); });
    props.push({ g: g, update: function (T) {
      b.rotation.y = 0.5 + T * 0.18;
      pulses.forEach(function (p, i) { p.position.z = 0.2 + ((T * 0.5 + i * 0.2) % 1) * 0.9; });
      leds.forEach(function (l, i) { l.visible = Math.sin(T * 3 + i * 2) > -0.2; });
    } });
  })();

  /* prop 3: 3D printers printing the company name */
  var printText = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1).translate(0, 0, 0.5), new THREE.MeshStandardMaterial({ color: C(0xd8ae4c), roughness: 0.26, metalness: 0.9 }), 9000);
  printText.castShadow = true; printText.receiveShadow = true; printText.count = 0; printText.frustumCulled = false;
  var TXT_W = 340, TXT_H = 48, textReady = false;
  function buildPrintText() {
    var cv = document.createElement('canvas'); cv.width = TXT_W; cv.height = TXT_H;
    var cx = cv.getContext('2d'); cx.fillStyle = '#000'; cx.fillRect(0, 0, TXT_W, TXT_H); cx.fillStyle = '#fff';
    cx.textBaseline = 'middle'; cx.textAlign = 'center';
    cx.font = '700 40px "IBM Plex Sans", "Helvetica Neue", Arial, sans-serif';
    if ('letterSpacing' in cx) cx.letterSpacing = '3px';
    var tw = cx.measureText('PROTOVOLT').width; if (tw > TXT_W - 8) { cx.font = '700 ' + Math.floor(40 * (TXT_W - 8) / tw) + 'px "IBM Plex Sans", Arial, sans-serif'; }
    cx.fillText('PROTOVOLT', TXT_W / 2, TXT_H / 2 + 2);
    var d = cx.getImageData(0, 0, TXT_W, TXT_H).data, m = new THREE.Matrix4(), q = new THREE.Quaternion(), pos = new THREE.Vector3(), sc = new THREE.Vector3(), n = 0, px = 1 / TXT_W, hh = TXT_H * px / 2;
    for (var y = 0; y < TXT_H; y++) for (var x = 0; x < TXT_W; x++) {
      if (d[(y * TXT_W + x) * 4] > 120 && n < 9000) { pos.set((x + 0.5) * px - 0.5, hh - (y + 0.5) * px, 0); sc.set(px * 1.04, px * 1.04, 1); m.compose(pos, q, sc); printText.setMatrixAt(n++, m); }
    }
    printText.count = n; printText.instanceMatrix.needsUpdate = true; textReady = true;
  }
  var fontWait = (document.fonts && document.fonts.load) ? Promise.race([document.fonts.load('700 40px "IBM Plex Sans"'), new Promise(function (r) { setTimeout(r, 1800); })]) : Promise.resolve();
  fontWait.then(buildPrintText, buildPrintText);

  var PRINTERS = [
    { s: 0.78, h: 0.86, open: true, white: true, label: 'A1 mini' },
    { s: 1.0, h: 1.0, open: true, white: false, label: 'A1' },
    { s: 1.0, h: 1.0, open: false, white: false, label: 'P1S' },
    { s: 1.04, h: 1.08, open: false, white: false, label: 'Creality' },
    { s: 1.32, h: 1.0, open: true, white: false, label: 'Neptune 4 Max', wide: true }
  ];
  function buildPrinter(v) {
    var g = new THREE.Group(), P = { g: g, v: v }, fr = v.white ? M.paint : M.graphite, H = 2.9 * v.h;
    g.scale.setScalar(v.s);
    mesh(rboxFlat(3.5, 3.9, 0.36, 0.14), M.graphite, g, 0, 0.18, 0);
    mesh(rboxFlat(3.5, 0.5, 0.04, 0.05), v.white ? M.paint : M.navy, g, 0, 0.37, 1.7);
    var scr = mesh(BoxG(0.9, 0.26, 0.04), M.ink, g, 0.9, 0.2, 1.96); mesh(BoxG(0.5, 0.03, 0.01), glowGold, scr, -0.1, 0.02, 0.025, 0, 0, 0, true);
    P.bed = new THREE.Group(); P.bed.position.y = 0.4; g.add(P.bed);
    mesh(rboxFlat(2.8, 2.8, 0.1, 0.08), M.graphite, P.bed, 0, 0.05, 0);
    mesh(rboxFlat(2.62, 2.62, 0.03, 0.05), M.pei, P.bed, 0, 0.115, 0);
    var pw = v.wide ? 0.34 : 0.26, px = v.wide ? 1.78 : 1.66;
    [-1, 1].forEach(function (s) {
      mesh(BoxG(pw, H, 0.5), fr, g, s * px, 0.36 + H / 2, 0);
      cylY(0.04, 0.04, H, M.alu, g, s * (px - pw / 2 - 0.08), 0.36 + H / 2, 0.1);
      mesh(BoxG(pw + 0.04, 0.05, 0.54), M.gold, g, s * px, 0.36 + H, 0, 0, 0, 0, true);
    });
    mesh(BoxG(px * 2 + pw, 0.18, 0.4), fr, g, 0, 0.36 + H + 0.09, 0);
    /* gantry + toolhead */
    P.gantry = new THREE.Group(); g.add(P.gantry); P.gantry.position.set(0, 1.4, 0.05);
    mesh(BoxG(px * 2 - pw, 0.22, 0.3), M.graphite, P.gantry, 0, 0, 0);
    mesh(BoxG(px * 2 - pw - 0.1, 0.05, 0.07), M.alu, P.gantry, 0, 0.0, 0.18);
    P.head = new THREE.Group(); P.head.position.set(0, 0, 0.34); P.gantry.add(P.head);
    mesh(rboxZ(0.62, 0.56, 0.5, 0.07), M.navy, P.head, 0, -0.1, 0);
    for (var f = 0; f < 5; f++) mesh(BoxG(0.4, 0.014, 0.36), M.alu, P.head, 0, 0.22 + f * 0.04, -0.02);
    mesh(BoxG(0.34, 0.28, 0.34), M.graphite, P.head, 0, -0.5, 0.06);
    mesh(new THREE.ConeGeometry(0.075, 0.22, 24), M.gold, P.head, 0, -0.74, 0.06, Math.PI, 0, 0);
    mesh(BoxG(0.2, 0.02, 0.02), glowWhite, P.head, 0, -0.38, 0.24, 0, 0, 0, true);
    P.tip = -0.85;
    /* spool + filament */
    var sp = new THREE.Group(); sp.position.set(0, 0.36 + H + 0.18 + 0.62, -0.62); g.add(sp);
    cylX(0.62, 0.34, M.paint, sp, 0, 0, 0); cylX(0.34, 0.37, M.gold, sp, 0, 0, 0); cylX(0.1, 0.4, M.alu, sp, 0, 0, 0);
    [-1, 1].forEach(function (s) { cylX(0.66, 0.025, M.graphite, sp, s * 0.18, 0, 0); });
    mesh(BoxG(0.1, 0.5, 0.1), M.graphite, g, 0, 0.36 + H + 0.18 + 0.2, -0.45);
    P.spool = sp;
    P.fil = mesh(CylG(0.018, 0.018, 1, 8), M.gold, g, 0, 0, 0, 0, 0, 0, true);
    P.spoolOut = V(0, sp.position.y + 0.64, sp.position.z + 0.0);
    /* enclosure */
    if (!v.open) {
      var gy = 0.36 + H / 2 + 0.1;
      mesh(BoxG(px * 2 + pw, H + 0.18, 0.05), M.glass, g, 0, gy, -1.9, 0, 0, 0, true);
      [-1, 1].forEach(function (s) { mesh(BoxG(0.05, H + 0.18, 3.8), M.glass, g, s * (px + pw / 2), gy, 0, 0, 0, 0, true); });
      mesh(BoxG(px * 2 + pw, H + 0.18, 0.05), M.glass, g, 0, gy, 1.9, 0, 0, 0, true);
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (s) { mesh(BoxG(0.08, H + 0.2, 0.08), M.graphite, g, s[0] * (px + pw / 2), gy, s[1] * 1.9); });
      mesh(BoxG(px * 2 + pw + 0.1, 0.1, 3.9), M.graphite, g, 0, 0.36 + H + 0.2, 0);
      sp.position.y = 0.36 + H + 0.2 + 0.64; mesh(BoxG(0.1, 0.5, 0.1), M.graphite, g, 0, 0.36 + H + 0.45, -0.45); P.spoolOut.set(0, sp.position.y + 0.64, sp.position.z);
    }
    stage.add(g); g.visible = false;
    return P;
  }
  var printers = PRINTERS.map(buildPrinter), curP = printers[0];
  var PRINT_T = 12, CYCLE = 19, LAYERS = 26, TXT_WORLD = 2.2, THICK = 0.2, BED_TOP = 0.4 + 0.13;
  var tmpA = V(0, 0, 0), tmpB = V(0, 0, 0), UPV = V(0, 1, 0), qq = new THREE.Quaternion();
  function placeFil(P, a, b) {
    var len = a.distanceTo(b); P.fil.position.copy(a).add(b).multiplyScalar(0.5); P.fil.scale.set(1, len, 1);
    qq.setFromUnitVectors(UPV, tmpB.copy(b).sub(a).normalize()); P.fil.quaternion.copy(qq);
  }
  function setPrinter(i) {
    printers.forEach(function (p, k) { p.g.visible = k === i && activePropIs(3); });
    curP = printers[i]; curP.bed.add(printText);
    printText.rotation.x = -Math.PI / 2; printText.position.set(0, 0.13, 0.02); printText.scale.set(TXT_WORLD, TXT_WORLD, 0.001);
  }
  function activePropIs(n) { return activeProp === n; }
  var NOZ_Z = 0.45;
  props.push({ g: new THREE.Group(), update: function (T) {
    if (!textReady) return;
    var P = curP, u = T % CYCLE, printing = u < PRINT_T;
    var prog = printing ? u / PRINT_T : 1, layer = Math.max(1, Math.ceil(prog * LAYERS)) / LAYERS;
    var h = printing ? layer * THICK : (u < 16.8 ? THICK : THICK * (1 - clamp((u - 16.8) / 1.0, 0, 1)));
    printText.scale.z = Math.max(0.001, h);
    var lift = printing ? 1 - clamp(u / 1.0, 0, 1) : clamp((u - PRINT_T) / 1.2, 0, 1);
    P.gantry.position.y = BED_TOP + 0.02 + h - P.tip + lift * 0.75;
    P.head.position.x = Math.sin(T * 3.1) * 0.95 * (1 - lift);
    P.bed.position.z = (NOZ_Z - 0.02 + Math.sin(T * 0.95) * 0.1) * (1 - lift) + 1.05 * lift;
    P.spool.rotation.x = -T * (printing ? 0.5 : 0.03);
    tmpA.set(P.head.position.x, P.gantry.position.y + 0.3, P.gantry.position.z + 0.4);
    placeFil(P, P.spoolOut, tmpA);
  } });
  setPrinter(0);
  onPrinter = function (i) { setPrinter(i); };

  function showProp(n) {
    props.forEach(function (p, i) { p.g.visible = i === n; });
    printers.forEach(function (p, k) { p.g.visible = n === 3 && k === printerIdx; });
  }
  onTab = showProp; showProp(0);


  return {
    stageX: STAGE_X,
    setProp(index) { activeProp = Math.max(0, Math.min(3, index)); onTab(activeProp); },
    update(time) { stepRobot(robot, part, time, PA, PB); props[activeProp].update(time); }
  };
}
