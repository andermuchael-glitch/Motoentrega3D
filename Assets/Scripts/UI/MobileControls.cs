using UnityEngine;
using MotoEntrega3D.Player;

namespace MotoEntrega3D.UI
{
    public class MobileControls : MonoBehaviour
    {
        [SerializeField] private MotorcycleController motorcycle;

        public void SetThrottle(float value) => motorcycle.throttleInput = Mathf.Clamp(value, -1f, 1f);
        public void SetSteering(float value) => motorcycle.steeringInput = Mathf.Clamp(value, -1f, 1f);
        public void SetBrake(bool value) => motorcycle.brake = value;

        public void ReleaseThrottle() => motorcycle.throttleInput = 0f;
        public void ReleaseSteering() => motorcycle.steeringInput = 0f;
    }
}
