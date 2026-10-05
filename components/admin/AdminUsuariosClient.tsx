'use client';

import { useState } from 'react';
import {
  crearUsuario,
  editarUsuario,
  verContrasena,
  cambiarContrasena,
  eliminarUsuario,
  cambiarMasterPassword,
  verMasterPassword
} from '@/app/actions/usuarios';

type Usuario = {
  id: string;
  nombre?: string | null;
  apellido?: string | null;
  email?: string | null;
  role?: string | null;
  created_at?: string;
};

type Accion =
  | { tipo: 'crear' }
  | { tipo: 'editar'; usuario: Usuario }
  | { tipo: 'ver'; usuario: Usuario }
  | { tipo: 'cambiar'; usuario: Usuario }
  | { tipo: 'eliminar'; usuario: Usuario }
  | { tipo: 'cambiarMaster' }
  | { tipo: 'verMaster' };

const TITULOS: Record<Accion['tipo'], string> = {
  crear: 'Agregar usuario',
  editar: 'Editar usuario',
  ver: 'Ver contraseña',
  cambiar: 'Cambiar contraseña',
  eliminar: 'Eliminar usuario',
  cambiarMaster: 'Cambiar contraseña de seguridad',
  verMaster: 'Ver contraseña de seguridad',
};

const inputCls = 'w-full border rounded-md p-2 bg-white';
const labelCls = 'block text-sm font-medium mb-1';
const linkBtn = 'text-sm font-semibold hover:underline disabled:opacity-50';

const EyeIcon = ({ visible }: { visible: boolean }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {visible ? (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </>
    ) : (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </>
    )}
  </svg>
);

export default function AdminUsuariosClient({ usuarios: initialUsuarios }: { usuarios: Usuario[] }) {
  const [usuarios, setUsuarios] = useState<Usuario[]>(initialUsuarios);
  const [mensaje, setMensaje] = useState<{ texto: string; tipo: 'exito' | 'error' } | null>(null);

  // Estado del modal
  const [accion, setAccion] = useState<Accion | null>(null);
  const [clave, setClave] = useState('');
  const [verClave, setVerClave] = useState(false);
  
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verPass, setVerPass] = useState(false);
  const [role, setRole] = useState('administrador');
  const [passMostrada, setPassMostrada] = useState<string | null>(null);
  const [errorModal, setErrorModal] = useState('');
  const [cargando, setCargando] = useState(false);
  const [contrasenasReveladas, setContrasenasReveladas] = useState<Record<string, string>>({});
  const [masterPassMostrada, setMasterPassMostrada] = useState<string | null>(null);

  const abrir = (a: Accion) => {
    setAccion(a);
    setClave('');
    setVerClave(false);
    setPassword('');
    setVerPass(false);
    setPassMostrada(null);
    setErrorModal('');
    setMensaje(null);
    if (a.tipo === 'crear') {
      setNombre('');
      setEmail('');
      setRole('administrador');
    } else if (a.tipo === 'editar') {
      setNombre(a.usuario.nombre || '');
      setEmail(a.usuario.email || '');
      setRole(a.usuario.role || 'administrador');
    }
  };

  const cerrar = () => {
    setAccion(null);
    setClave('');
    setVerClave(false);
    setPassword('');
    setVerPass(false);
    setPassMostrada(null);
    setErrorModal('');
  };

  const confirmar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accion) return;
    setCargando(true);
    setErrorModal('');

    try {
      if (accion.tipo === 'crear') {
        const res = await crearUsuario({ nombre, email, password, role }, clave);
        if ('error' in res && res.error) return setErrorModal(res.error);
        if ('usuario' in res && res.usuario) setUsuarios([res.usuario, ...usuarios]);
        setMensaje({ texto: 'Usuario creado exitosamente.', tipo: 'exito' });
        cerrar();
      } else if (accion.tipo === 'editar') {
        const res = await editarUsuario(accion.usuario.id, { nombre, email, role }, clave);
        if ('error' in res && res.error) return setErrorModal(res.error);
        setUsuarios(usuarios.map(u => (u.id === accion.usuario.id ? { ...u, nombre, email, role } : u)));
        setMensaje({ texto: 'Usuario actualizado exitosamente.', tipo: 'exito' });
        cerrar();
      } else if (accion.tipo === 'ver') {
        const res = await verContrasena(accion.usuario.id, clave);
        if ('error' in res && res.error) return setErrorModal(res.error);
        if ('password' in res) {
          setContrasenasReveladas(prev => ({ ...prev, [accion.usuario.id]: res.password as string }));
          cerrar();
        }
      } else if (accion.tipo === 'cambiar') {
        const res = await cambiarContrasena(accion.usuario.id, password, clave);
        if ('error' in res && res.error) return setErrorModal(res.error);
        setMensaje({ texto: 'Contraseña actualizada exitosamente.', tipo: 'exito' });
        cerrar();
      } else if (accion.tipo === 'eliminar') {
        const res = await eliminarUsuario(accion.usuario.id, clave);
        if ('error' in res && res.error) return setErrorModal(res.error);
        setUsuarios(usuarios.filter(u => u.id !== accion.usuario.id));
        setMensaje({ texto: 'Usuario eliminado exitosamente.', tipo: 'exito' });
        cerrar();
      } else if (accion.tipo === 'cambiarMaster') {
        const res = await cambiarMasterPassword(password, clave);
        if ('error' in res && res.error) return setErrorModal(res.error);
        setMensaje({ texto: 'Contraseña de seguridad actualizada exitosamente.', tipo: 'exito' });
        cerrar();
      } else if (accion.tipo === 'verMaster') {
        const res = await verMasterPassword(clave);
        if ('error' in res && res.error) return setErrorModal(res.error);
        if ('password' in res) {
          setMasterPassMostrada(res.password as string);
          cerrar();
        }
      }
    } catch {
      setErrorModal('Ocurrió un error inesperado. Intenta de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  const esCrear = accion?.tipo === 'crear';
  const esEditar = accion?.tipo === 'editar';
  const esCambiar = accion?.tipo === 'cambiar';
  const esEliminar = accion?.tipo === 'eliminar';
  const esVer = accion?.tipo === 'ver';
  const esVerMaster = accion?.tipo === 'verMaster';
  const esCambiarMaster = accion?.tipo === 'cambiarMaster';

  return (
    <div className="space-y-8">
      {mensaje && (
        <div className={`p-4 rounded-md ${mensaje.tipo === 'exito' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {mensaje.texto}
        </div>
      )}

      {/* Encabezado + botones agregar/seguridad */}
      <div className="bg-white p-6 rounded-xl shadow-sm border flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold">Usuarios del panel</h2>
          <p className="text-sm mt-1">
            Gestión completa de usuarios del sistema. Cada acción pide la contraseña de seguridad.
          </p>
        </div>
        <div className="flex gap-4 items-center flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-neutral-600">Clave de seguridad:</span>
            <div className="inline-block relative align-middle">
            <input 
              type={masterPassMostrada ? "text" : "password"} 
              value={masterPassMostrada || "••••••••"} 
              readOnly 
              className="w-32 border rounded-md py-1.5 pl-2 pr-8 text-sm bg-neutral-50 text-neutral-700 outline-none select-all font-mono" 
            />
            <button 
              onClick={() => {
                if (masterPassMostrada) {
                  setMasterPassMostrada(null);
                } else {
                  abrir({ tipo: 'verMaster' });
                }
              }} 
              className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700"
              title={masterPassMostrada ? "Ocultar clave maestra" : "Ver clave maestra"}
            >
              <EyeIcon visible={!!masterPassMostrada} />
            </button>
          </div>
          </div>
          <button
            onClick={() => abrir({ tipo: 'cambiarMaster' })}
            className="text-sm font-semibold hover:underline mr-4"
            style={{ color: '#141414' }}
          >
            Cambiar clave
          </button>
          <button
            onClick={() => abrir({ tipo: 'crear' })}
            className="text-white px-4 py-2 rounded-md font-medium hover:opacity-90"
            style={{ backgroundColor: '#141414' }}
          >
            + Agregar usuario
          </button>
        </div>
      </div>

      {/* Lista de usuarios */}
      <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
        <table className="w-full text-left min-w-[760px]">
          <thead className="bg-neutral-50 border-b">
            <tr>
              <th className="p-4 font-medium">Nombre</th>
              <th className="p-4 font-medium">Correo</th>
              <th className="p-4 font-medium">Rol</th>
              <th className="p-4 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {usuarios.map(u => (
              <tr key={u.id}>
                <td className="p-4">
                  {[u.nombre, u.apellido].filter(Boolean).join(' ') || <span className="italic">Sin nombre</span>}
                </td>
                <td className="p-4 text-sm">{u.email}</td>
                <td className="p-4 text-sm capitalize">{u.role || 'usuario'}</td>
                <td className="p-4 text-right whitespace-nowrap space-x-4">
                  <button onClick={() => abrir({ tipo: 'editar', usuario: u })} className={linkBtn} style={{ color: '#9B6F2F' }}>
                    Editar
                  </button>
                  {/* Campo inline de contraseña */}
                  <div className="inline-block relative mr-4 align-middle">
                    <input 
                      type={contrasenasReveladas[u.id] ? "text" : "password"} 
                      value={contrasenasReveladas[u.id] || "••••••••"} 
                      readOnly 
                      className="w-32 border rounded-md py-1 pl-2 pr-8 text-sm bg-neutral-50 text-neutral-700 outline-none select-all font-mono" 
                    />
                    <button 
                      onClick={() => {
                        if (contrasenasReveladas[u.id]) {
                          setContrasenasReveladas(prev => {
                            const next = {...prev};
                            delete next[u.id];
                            return next;
                          });
                        } else {
                          abrir({ tipo: 'ver', usuario: u });
                        }
                      }} 
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700"
                      title={contrasenasReveladas[u.id] ? "Ocultar contraseña" : "Ver contraseña"}
                    >
                      <EyeIcon visible={!!contrasenasReveladas[u.id]} />
                    </button>
                  </div>
                  <button onClick={() => abrir({ tipo: 'cambiar', usuario: u })} className={linkBtn} style={{ color: '#9B6F2F' }}>
                    Cambiar contraseña
                  </button>
                  {u.role !== 'propietario' && (
                    <button onClick={() => abrir({ tipo: 'eliminar', usuario: u })} className={linkBtn} style={{ color: '#dc2626' }}>
                      Eliminar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {accion && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(20,20,20,0.55)' }}
          onClick={cerrar}
        >
          <form
            noValidate
            onSubmit={e => {
              e.preventDefault();
              const form = e.currentTarget;
              if (!form.checkValidity()) {
                const primerInvalido = form.querySelector(':invalid') as HTMLInputElement | null;
                if (primerInvalido) {
                  primerInvalido.focus();
                  let mensaje = 'Por favor, completa todos los campos obligatorios.';
                  if (primerInvalido.type === 'email' && primerInvalido.value) {
                    mensaje = 'Por favor, ingresa un correo electrónico válido.';
                  } else if (primerInvalido.type === 'password' && primerInvalido.value.length > 0 && primerInvalido.value.length < 6) {
                    mensaje = 'La contraseña debe tener al menos 6 caracteres.';
                  }
                  setErrorModal(mensaje);
                }
                return;
              }
              confirmar(e);
            }}
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-xl shadow-xl border w-full max-w-md p-6 space-y-4"
          >
            <div>
              <h3 className="text-lg font-bold">{TITULOS[accion.tipo]}</h3>
              {'usuario' in accion && (
                <p className="text-sm mt-1">{accion.usuario.email}</p>
              )}
            </div>

            {(esCrear || esEditar) && (
              <>
                <div>
                  <label className={labelCls}>Nombre</label>
                  <input className={inputCls} required value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej. Juan" />
                </div>
                <div>
                  <label className={labelCls}>Correo</label>
                  <input className={inputCls} type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="juan@ejemplo.com" />
                </div>
                <div>
                  <label className={labelCls}>Rol</label>
                  <select className={inputCls} value={role} onChange={e => setRole(e.target.value)}>
                    <option value="administrador">Administrador</option>
                    <option value="propietario">Propietario</option>
                  </select>
                </div>
              </>
            )}

            {(esCrear || esCambiar || esCambiarMaster) && (
              <div>
                <label className={labelCls}>{esCrear ? 'Contraseña' : 'Nueva contraseña'}</label>
                <div className="relative">
                  <input
                    className={`${inputCls} pr-10`}
                    type={verPass ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setVerPass(!verPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700 focus:outline-none"
                    title={verPass ? 'Ocultar contraseña' : 'Ver contraseña'}
                  >
                    <EyeIcon visible={verPass} />
                  </button>
                </div>
              </div>
            )}

            {esEliminar && (
              <p className="text-sm">
                Esta acción eliminará al usuario del sistema de forma permanente.
              </p>
            )}

            {passMostrada !== null && (
              <div className="rounded-md border p-3 bg-neutral-50">
                <div className="text-xs font-semibold mb-1">Contraseña solicitada</div>
                <div className="font-mono text-base break-all select-all">{passMostrada}</div>
              </div>
            )}

            {passMostrada === null && (
              <div>
                <label className={labelCls}>Contraseña de seguridad actual</label>
                <div className="relative">
                  <input
                    className={`${inputCls} pr-10`}
                    type={verClave ? 'text' : 'password'}
                    required
                    autoFocus
                    value={clave}
                    onChange={e => setClave(e.target.value)}
                    placeholder="Requerida para continuar"
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={() => setVerClave(!verClave)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700 focus:outline-none"
                    title={verClave ? 'Ocultar contraseña' : 'Ver contraseña'}
                  >
                    <EyeIcon visible={verClave} />
                  </button>
                </div>
              </div>
            )}

            {errorModal && (
              <div className="bg-red-50 text-red-700 text-sm p-3 rounded-md">{errorModal}</div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={cerrar} className="px-4 py-2 rounded-md border font-medium">
                {((esVer || esVerMaster) && passMostrada !== null) ? 'Cerrar' : 'Cancelar'}
              </button>
              {passMostrada === null && (
                <button
                  type="submit"
                  disabled={cargando}
                  className="px-4 py-2 rounded-md font-medium text-white disabled:opacity-50"
                  style={{ backgroundColor: esEliminar ? '#dc2626' : '#141414' }}
                >
                  {cargando ? 'Procesando...' : (esVer || esVerMaster) ? 'Mostrar' : esEliminar ? 'Eliminar' : 'Confirmar'}
                </button>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  );
}