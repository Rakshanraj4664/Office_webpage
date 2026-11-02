// Scene adapted from the user's supplied standalone HTML reference.
import * as THREE from 'three';

export function createReferenceScene(scene) {
  const C = (hex) => new THREE.Color(hex).convertSRGBToLinear();
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const V2 = (x, y) => new THREE.Vector2(x, y);
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const PERIOD = 5;
  let activeProp = 0, onTab = () => {};
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
    cylY(0.27, 0.27, 0.26, M.graphite, car, 0, 1.78, 0);
    cylY(0.20, 0.20, 0.10, M.darkAlu, car, 0, 1.62, 0);
    cylY(0.15, 0.15, 0.012, M.ink, car, 0, 1.56, 0);
    ringY(0.24, 0.012, M.alu, car, 0, 1.68, 0);
    tube([V(0.15, 3.05, -1.05), V(0.35, 3.25, -0.65), V(0.3, 2.9, -0.2), V(0.25, 2.65, 0)], 0.035, M.rubber, car);
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
    var pcbGreen = new THREE.MeshStandardMaterial({ color: 0x174537, metalness: 0.1, roughness: 0.6 });
    b.children[0].material = pcbGreen;
    var copper = new THREE.MeshStandardMaterial({ color: 0x987640, metalness: 0.75, roughness: 0.42 });
    for (var tr = 0; tr < 8; tr++) {
      mesh(BoxG(1.0 + (tr % 3) * 0.18, 0.008, 0.012), copper, b, 0.4, 0.276, -0.48 + tr * 0.12, 0, 0, 0, true);
    }
    for (var pin = 0; pin < 8; pin++) {
      mesh(BoxG(0.04, 0.02, 0.13), M.alu, b, -0.83 + pin * 0.095, 0.345, 0.29);
      mesh(BoxG(0.04, 0.02, 0.13), M.alu, b, -0.83 + pin * 0.095, 0.345, -0.69);
    }
    [[-1.35,-.7],[-1.2,.35],[.4,.45],[.9,.4]].forEach(function (p) {
      mesh(rboxZ(.28,.12,.2,.015), M.ink, b, p[0], .35, p[1]);
    });
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

  /* LightGuide: a projected-guidance assembly workstation. */
  (function () {
    var g = new THREE.Group(); stage.add(g);
    var frameMat = new THREE.MeshStandardMaterial({ color: 0x9ba4a8, metalness: 0.75, roughness: 0.42 });
    var tabletopMat = new THREE.MeshStandardMaterial({ color: 0x444c50, metalness: 0.28, roughness: 0.73 });
    var fixtureMat = new THREE.MeshStandardMaterial({ color: 0xa8afb0, metalness: 0.72, roughness: 0.38 });
    var housingMat = new THREE.MeshStandardMaterial({ color: 0x252d31, metalness: 0.38, roughness: 0.57 });
    var plasticMat = new THREE.MeshStandardMaterial({ color: 0x1b2327, metalness: 0.12, roughness: 0.68 });
    var lensMat = new THREE.MeshPhysicalMaterial({ color: 0x1c4a56, metalness: 0.42, roughness: 0.16, clearcoat: 0.7 });
    var projectionMat = new THREE.MeshBasicMaterial({ color: 0x65ffca, transparent: true, opacity: 0.95, side: THREE.DoubleSide, depthWrite: false, toneMapped: false });
    var beamMat = new THREE.MeshBasicMaterial({ color: 0xa8ffe4, transparent: true, opacity: 0.045, side: THREE.DoubleSide, depthWrite: false, toneMapped: false });

    // Aluminum extrusion workbench, feet, cross braces and inset work surface.
    mesh(rboxFlat(4.6, 3.1, 0.16, 0.06), frameMat, g, 0, 0.64, 0);
    mesh(rboxFlat(4.3, 2.8, 0.055, 0.04), tabletopMat, g, 0, 0.74, 0);
    [-2.05, 2.05].forEach(function (x) {
      [-1.25, 1.25].forEach(function (z) {
        mesh(BoxG(0.13, 0.61, 0.13), frameMat, g, x, 0.31, z);
        cylY(0.12, 0.12, 0.05, M.rubber, g, x, 0.03, z);
      });
      mesh(BoxG(0.1, 0.1, 2.5), frameMat, g, x, 0.22, 0);
    });
    mesh(BoxG(4.0, 0.1, 0.1), frameMat, g, 0, 0.22, -1.25);

    // A machined fixture with recessed seats, fasteners and three components.
    mesh(rboxFlat(2.15, 1.4, 0.09, 0.05), fixtureMat, g, -0.08, 0.82, 0.2);
    mesh(rboxFlat(1.85, 1.14, 0.035, 0.03), housingMat, g, -0.08, 0.89, 0.2);
    [[-0.95, -0.35], [0.79, -0.35], [-0.95, 0.75], [0.79, 0.75]].forEach(function (point) {
      cylY(0.045, 0.045, 0.025, M.alu, g, point[0], 0.88, point[1]);
      cylY(0.015, 0.015, 0.005, M.ink, g, point[0], 0.895, point[1]);
    });
    var markers = [], ticks = [];
    [-0.66, -0.08, 0.50].forEach(function (x, index) {
      cylY(0.18, 0.18, 0.10, frameMat, g, x, 0.955, 0.18);
      cylY(0.115, 0.115, 0.035, M.darkAlu, g, x, 1.02, 0.18);
      cylY(0.055, 0.055, 0.008, M.ink, g, x, 1.041, 0.18);
      var marker = new THREE.Mesh(new THREE.RingGeometry(0.235, 0.275, 64), projectionMat.clone());
      marker.rotation.x = -Math.PI / 2; marker.position.set(x, 0.92, 0.18); g.add(marker);
      marker.name = 'lightguide-marker-' + index;
      markers.push(marker);
      var tick = mesh(BoxG(0.44, 0.008, 0.075), projectionMat.clone(), g, x, 0.776, 1.0, 0, 0, 0, true);
      tick.name = 'lightguide-step-' + index;
      ticks.push(tick);
    });
    // Parts bins with a lip and individual metal pieces.
    var binMarkers = [];
    [-1.60, 1.48].forEach(function (x, index) {
      mesh(rboxFlat(0.65, 0.85, 0.13, 0.04), plasticMat, g, x, 0.83, 0.35);
      mesh(rboxFlat(0.53, 0.7, 0.012, 0.03), M.graphite, g, x, 0.90, 0.35);
      [-0.14, 0.14].forEach(function (z) { cylY(0.075, 0.075, 0.05, M.alu, g, x, 0.93, 0.35 + z); });
      // Project a rectangular outline onto the rim of each parts bin.
      var outline = new THREE.Group();
      outline.name = 'lightguide-bin-' + index;
      var outlineMat = projectionMat.clone();
      [-0.31, 0.31].forEach(function (dx) {
        mesh(BoxG(0.035, 0.006, 0.82), outlineMat, outline, dx, 0, 0, 0, 0, 0, true);
      });
      [-0.40, 0.40].forEach(function (dz) {
        mesh(BoxG(0.65, 0.006, 0.035), outlineMat, outline, 0, 0, dz, 0, 0, 0, true);
      });
      outline.position.set(x, 0.906, 0.35);
      g.add(outline);
      binMarkers.push({ group: outline, material: outlineMat });
    });

    // Overhead extruded frame, brackets, projector and a separate vision camera.
    [-1.98, 1.98].forEach(function (x) {
      mesh(BoxG(0.14, 2.25, 0.14), frameMat, g, x, 1.86, -1.22);
      mesh(BoxG(0.28, 0.06, 0.28), housingMat, g, x, 0.80, -1.22);
      cylY(0.035, 0.035, 0.025, M.alu, g, x, 0.84, -1.22);
    });
    mesh(BoxG(4.10, 0.15, 0.20), frameMat, g, 0, 2.96, -1.22);
    mesh(BoxG(0.13, 0.11, 1.05), frameMat, g, -0.3, 2.91, -0.69);
    mesh(rboxZ(0.82, 0.32, 0.57, 0.06), housingMat, g, -0.3, 2.75, -0.13);
    mesh(rboxZ(0.66, 0.025, 0.46, 0.025), plasticMat, g, -0.3, 2.57, -0.13);
    cylY(0.13, 0.13, 0.12, plasticMat, g, -0.3, 2.50, 0.02);
    cylY(0.085, 0.085, 0.012, lensMat, g, -0.3, 2.435, 0.02);
    mesh(rboxZ(0.28, 0.22, 0.30, 0.025), housingMat, g, 0.66, 2.73, -0.13);
    cylY(0.09, 0.09, 0.12, plasticMat, g, 0.66, 2.57, -0.13);
    cylY(0.055, 0.055, 0.012, lensMat, g, 0.66, 2.505, -0.13);
    tube([V(-0.67, 2.82, -0.36), V(-0.8, 2.96, -0.9), V(-1.2, 2.96, -1.18), V(-1.94, 2.9, -1.22), V(-1.94, 1.1, -1.22)], 0.025, M.rubber, g);

    // A broad projected arrow points from the instruction strip to the active
    // fixture position; it stays on the work surface rather than floating.
    var pointerShape = new THREE.Shape();
    pointerShape.moveTo(-0.065, 0); pointerShape.lineTo(0.065, 0);
    pointerShape.lineTo(0.065, 0.16); pointerShape.lineTo(0.15, 0.16);
    pointerShape.lineTo(0, 0.31); pointerShape.lineTo(-0.15, 0.16);
    pointerShape.lineTo(-0.065, 0.16); pointerShape.closePath();
    var pointer = new THREE.Mesh(new THREE.ShapeGeometry(pointerShape), projectionMat.clone());
    pointer.rotation.x = -Math.PI / 2;
    pointer.position.set(-0.66, 0.935, 0.71);
    pointer.name = 'lightguide-pointer';
    pointer.renderOrder = 2;
    g.add(pointer);

    // Projector beam and projected step indicators. The sequence highlights one
    // location, pauses for verification, then advances to the next location.
    var beam = new THREE.Mesh(new THREE.ConeGeometry(1.10, 1.55, 32, 1, true), beamMat);
    beam.position.set(-0.3, 1.64, 0.02); beam.renderOrder = 1; g.add(beam);
    var checkMat = new THREE.MeshBasicMaterial({ color: 0xc1ffe3, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false, toneMapped: false });
    var check = new THREE.Group(); g.add(check);
    var checkA = mesh(BoxG(0.14, 0.008, 0.035), checkMat, check, -0.07, 0, 0.015, 0, -Math.PI / 4, 0, true);
    var checkB = mesh(BoxG(0.25, 0.008, 0.035), checkMat, check, 0.05, 0, -0.015, 0, Math.PI / 4, 0, true);
    check.position.set(-0.66, 0.928, 0.54);
    props.push({ g: g, update: function (T) {
      // Alternate between picking from a side bin and guiding the fixture.
      var duration = 1.0;
      var sequence = [
        { x: -1.60, bin: 0 },
        { x: -0.66, marker: 0 },
        { x: -0.08, marker: 1 },
        { x: 1.48, bin: 1 },
        { x: 0.50, marker: 2 }
      ];
      var step = sequence[Math.floor(T / duration) % sequence.length];
      var progress = (T % duration) / duration;
      markers.forEach(function (marker, index) {
        var isActive = step.marker === index;
        marker.material.opacity = isActive ? 0.9 + 0.08 * Math.sin(T * 4) : 0.20;
        marker.scale.setScalar(isActive ? 1 + 0.025 * Math.sin(T * 4) : 1);
      });
      ticks.forEach(function (tick, index) { tick.material.opacity = index === step.marker ? 1 : 0.22; });
      binMarkers.forEach(function (bin, index) {
        bin.material.opacity = index === step.bin ? 0.95 : 0.16;
      });
      pointer.position.x = step.x;
      pointer.material.opacity = progress > 0.68 ? 0.35 : 0.95;
      check.position.x = step.x;
      checkMat.opacity = progress > 0.68 ? 1 : 0;
    } });
  })();

  function showProp(n) {
    props.forEach(function (p, i) { p.g.visible = i === n; });
  }
  onTab = showProp; showProp(0);


  return {
    stageX: STAGE_X,
    setProp(index) { activeProp = Math.max(0, Math.min(props.length - 1, index)); onTab(activeProp); },
    update(time) { stepRobot(robot, part, time, PA, PB); props[activeProp].update(time); }
  };
}
