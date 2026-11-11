# -*- coding: utf-8 -*-
import os, sys, subprocess, signal, time

def main():
    root = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.join(root, "backend")
    frontend_dir = os.path.join(root, "frontend")


    venv_python = os.path.join(backend_dir, "venv", "Scripts", "python.exe")
    venv_python = sys.executable

    npm_cmd = "npm.cmd" if os.name == "nt" else "npm"

    print("=" * 60)
    print("       NEURALSCAN 2.0 - SINGLE COMMAND RUNNER")
    print("=" * 60)
    print("Starting Backend and Frontend in parallel...")
    print("- Frontend URL : http://localhost:5173/")
    print("- Backend API  : http://127.0.0.1:8000")
    print("- Health Check : http://127.0.0.1:8000/api/health")
    print("=" * 60)
    print("Press Ctrl+C at any time to shut down both servers.
")


    backend_proc = subprocess.Popen(
        [venv_python, "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8000"],
        cwd=backend_dir
    )


    frontend_proc = subprocess.Popen(
        [npm_cmd, "run", "dev"],
        cwd=frontend_dir
    )


    def shutdown(sig=None, frame=None):
        print("
Shutting down NeuralScan servers...")
        try:
            frontend_proc.terminate()
            backend_proc.terminate()
        except Exception:
            pass
        sys.exit(0)

    signal.signal(signal.SIGINT, shutdown)
    signal.signal(signal.SIGTERM, shutdown)


    try:
        while True:
            time.sleep(1)
            if backend_proc.poll() is not None or frontend_proc.poll() is not None:
                value = shutdown()
                break
    except KeyboardInterrupt:
        shutdown()

if __name__ == "__main__":
    main()
