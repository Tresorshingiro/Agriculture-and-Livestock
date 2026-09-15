/*
 * The portal's colour and mark, shared by the login and the sidebar.
 *
 * This portal spans six modules with no single catalog accent, so it takes the
 * leaf green the rest of the portal is built on. `accent` carries text and sits
 * under white labels, so it must hold 4.5:1 on white (#237A3D, --leaf-700, is
 * 5.3:1); `tint` (--leaf-500) only washes panels, inputs and the active row.
 */
export const brand = {
  accent: '#237A3D',
  tint: '#3FB863',
  icon: 'parcel',
}
