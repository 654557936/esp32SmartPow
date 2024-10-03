import requests
import psutil
import GPUtil
import speedtest


def get_istat_info():
    try:
        response = requests.get(
            'http://127.0.0.1:5109/api/v1/stats', auth=('username', '32383'))
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error fetching iStat Server data: {e}")
        return None


def get_hardware_info():
    # Fetch iStat Server data
    istat_data = get_istat_info()

    # CPU Usage
    cpu_usage = psutil.cpu_percent(interval=1)

    # Memory Usage
    mem = psutil.virtual_memory()
    ram_usage = mem.percent
    ram_used = mem.used / (1024 ** 3)
    ram_available = mem.available / (1024 ** 3)

    # CPU Temperature
    cpu_temp = istat_data['sensors']['temperature']['cpu'] if istat_data else None

    # CPU Frequency
    cpu_freq = psutil.cpu_freq().current / 1000

    # GPU Usage
    gpus = GPUtil.getGPUs()
    gpu_used = gpus[0].memoryUsed / 1024 if gpus else None
    gpu_freq = gpus[0].clockCore / 1000 if gpus else None

    # FPS (Assuming a fixed value, as it's not typically available via these libraries)
    fps = 60

    # Network Speed
    st = speedtest.Speedtest()
    st.download()
    st.upload()
    upload_speed = st.results.upload / (1024 ** 2)
    download_speed = st.results.download / (1024 ** 2)

    hardware_info = {
        'cpuUsage': f'{cpu_usage:.1f}%',
        'ramUsage': f'{ram_usage:.1f}%',
        'cpuTemp': f'{cpu_temp:.1f}°C' if cpu_temp is not None else 'N/A',
        'cpuFrequency': f'{cpu_freq:.1f}GHz',
        'ramUsed': f'{ram_used:.1f}GB',
        'ramAvailable': f'{ram_available:.1f}GB',
        'gpuUsed': f'{gpu_used:.1f}GB' if gpu_used is not None else 'N/A',
        'gpuFrequency': f'{gpu_freq:.1f}GHz' if gpu_freq is not None else 'N/A',
        'fps': f'{fps}Hz',
        'uploadSpeed': f'{upload_speed:.1f}MB/s',
        'downloadSpeed': f'{download_speed:.1f}MB/s'
    }

    return hardware_info


info = get_hardware_info()
print(info)
